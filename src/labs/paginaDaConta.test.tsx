// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DA_CONTA, TopoDaConta, LateralDaConta, CartaoDaConta, TituloDaSecao,
  FaixaDaConta, EscolhaDeMetodo, CaixaDeCodigos, LinhaDeAplicativo,
  LinhaDeSessao, LinhaDeEncaminhamento, LinhaDeAjuste, CaixaDeVazamento,
} from './paginaDaConta';
import {
  contaDoClube, contaInvadida, vazamentosDe, ENDERECO_DO_INTRUSO,
} from './contaOnline';

/*
  A página de configurações da conta.

  ── O que esta trava existe para pegar ───────────────────────────────────
  `contaOnline.test.ts` prova que as contas do motor estão certas. Não prova
  que a tela mostra qualquer uma delas — e nesta vereda o que a tela mostra
  **é** a lição: o que um método de duas etapas não cobre, o último uso de um
  aplicativo, a data de um vazamento. Uma peça que some no caminho deixa o
  motor correto e a lição sem matéria.

  É a diferença que `exploradorValidator.test.ts` documentou: trava de motor
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

const CONTA = contaDoClube();

/* ── As quatro seções, e todas sempre ──────────────────────────────────────── */

describe('a lateral traz as quatro seções, e nenhuma some conforme a lição', () => {
  it('as quatro estão lá', () => {
    /*
      Um programa tem todos os comandos. Uma conta que só mostrasse
      "Privacidade" na lição de privacidade ensinaria a procurar o botão que a
      tarefa quer, e não a procurar no programa — a regra da faixa do
      Explorador e da do leitor de PDF.

      A trava lê a **tela desenhada**, e não uma lista exportada: é a tela que
      responde pelo que existe.
    */
    montar(<LateralDaConta atual="seguranca" aoTrocar={() => {}} />);
    for (const s of ['Segurança', 'Aplicativos conectados', 'Privacidade', 'Atividade da conta']) {
      expect(texto(), `${s} sumiu da lateral`).toContain(s);
    }
  });

  it('e a seção aberta se lê pelo aria-current, e não pela cor', () => {
    montar(<LateralDaConta atual="privacidade" aoTrocar={() => {}} />);
    const aberta = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(aberta?.textContent).toContain('Privacidade');
  });

  it('e a lateral não troca de seção por conta própria', () => {
    /* Uma lateral com seção própria obrigaria os dois lados a concordar sobre
       a mesma seção, que é a forma mais rápida de mostrarem coisas diferentes. */
    montar(<LateralDaConta atual="privacidade" aoTrocar={() => {}} />);
    clicar(botoes().find(b => b.textContent?.includes('Segurança')));
    const aberta = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(aberta?.textContent, 'a lateral mudou de seção sozinha').toContain('Privacidade');
  });

  it('o topo diz de que conta se trata', () => {
    montar(<TopoDaConta conta={CONTA} />);
    expect(texto()).toContain('clubepioneiros@gmail.com');
    expect(texto()).toContain('Correio do clube');
  });
});

/* ── As duas etapas: o requisito 4.2 ───────────────────────────────────────── */

describe('a escolha do método mostra os três, e o que cada um não cobre', () => {
  it('os três aparecem, o SMS primeiro, como todo serviço os oferece', () => {
    montar(<EscolhaDeMetodo aoEscolher={() => {}} />);
    const nomes = botoes().map(b => b.textContent ?? '');
    expect(nomes).toHaveLength(3);
    expect(nomes[0]).toMatch(/mensagem de texto/i);
  });

  it('e cada um traz o lado que ele não cobre, escrito na tela', () => {
    /*
      Sem isso a escolha do requisito 4.2 deixa de ser da pessoa: ou a
      plataforma recomenda um, ou os três viram o mesmo botão com nomes
      diferentes. O programa relata; o veredito é de quem lê — é a régua de
      status do Word e o painel de Problemas do Python.
    */
    montar(<EscolhaDeMetodo aoEscolher={() => {}} />);
    const contra = [...container.querySelectorAll('p[data-lado="contra"]')];
    expect(contra, 'o lado ruim sumiu de algum método').toHaveLength(3);
    for (const p of contra) expect((p.textContent ?? '').length).toBeGreaterThan(20);
  });

  it('e o escolhido se lê pelo aria-pressed', () => {
    montar(<EscolhaDeMetodo escolhido="chave" aoEscolher={() => {}} />);
    const marcado = botoes().find(b => b.getAttribute('aria-pressed') === 'true');
    expect(marcado?.textContent).toMatch(/chave/i);
  });
});

describe('a caixa de códigos fecha sem guardar, e é a armadilha do 4.2', () => {
  it('há como baixar e há como fechar, e são dois botões diferentes', () => {
    /*
      A armadilha inteira. O serviço mostra os códigos uma vez, e fechar é um
      clique. A tela fica dizendo "ativada", tudo parece certo, e a conta se
      perde no dia em que o telefone se perder. Uma caixa que só fechasse
      depois de baixar apagaria o gesto que a lição existe para mostrar.
    */
    const guardar = vi.fn();
    const fechar = vi.fn();
    montar(
      <CaixaDeCodigos
        codigos={['12345678', '23456789']} guardados={false}
        aoGuardar={guardar} aoFechar={fechar}
      />,
    );
    expect(texto()).toContain('12345678');

    clicar(botoes().find(b => b.textContent?.includes('Fechar')));
    expect(fechar, 'não dá para fechar a caixa').toHaveBeenCalledOnce();
    expect(guardar, 'fechar guardou os códigos sozinho').not.toHaveBeenCalled();

    clicar(botoes().find(b => b.textContent?.includes('Baixar')));
    expect(guardar).toHaveBeenCalledOnce();
  });

  it('e depois de baixar a caixa diz onde o arquivo ficou', () => {
    /* Sem isso, baixar é um clique sem resposta, e ninguém sabe se funcionou —
       que é o mesmo defeito, do outro lado. */
    montar(
      <CaixaDeCodigos codigos={['12345678']} guardados aoGuardar={() => {}} aoFechar={() => {}} />,
    );
    expect(texto()).toContain('codigos-de-reserva.txt');
  });
});

/* ── Os aplicativos: o requisito 4.3 ───────────────────────────────────────── */

describe('o aplicativo mostra o que dá para revisar nele', () => {
  const app = CONTA.aplicativos.find(a => a.id === 'fotomagica')!;

  it('o último uso aparece, porque é por ele que se revisa', () => {
    montar(<LinhaDeAplicativo app={app} />);
    expect(texto()).toContain('usado pela última vez');
    expect(texto()).toContain(app.ultimoUso!);
  });

  it('e as permissões aparecem em português, e não como código', () => {
    /*
      Uma lista de escopos crus — `ler-email` — não se revisa: o desbravador
      não tem como decidir sobre o que não entende, e o requisito 4.3 diz
      *revisar* antes de *revogar*.
    */
    montar(<LinhaDeAplicativo app={app} />);
    expect(texto()).toContain('Ler todas as suas mensagens');
    expect(texto()).not.toContain('ler-email');
  });

  it('sem aoRevogar não há botão prometendo um gesto que não acontece', () => {
    montar(<LinhaDeAplicativo app={app} />);
    expect(porRotulo(`Remover o acesso de ${app.nome}`)).toBeUndefined();

    montar(<LinhaDeAplicativo app={app} aoRevogar={() => {}} />);
    expect(porRotulo(`Remover o acesso de ${app.nome}`)).toBeDefined();
  });
});

/* ── As sessões e o encaminhamento: o requisito 6 ──────────────────────────── */

describe('a atividade da conta mostra o que o requisito 6 manda conferir', () => {
  const invadida = contaInvadida();

  it('a sessão diz aparelho, lugar e quando — e não diz de quem é', () => {
    /*
      Adivinhar pela tela seria pôr a resposta na nossa página: o desbravador
      conclui que a sessão é estranha porque **não reconhece o aparelho**, que
      é o que ele vai fazer na conta dele.
    */
    const s = invadida.sessoes.find(x => x.intruso)!;
    montar(<LinhaDeSessao sessao={s} aoEncerrar={() => {}} />);
    expect(texto()).toContain('Windows — navegador desconhecido');
    expect(texto()).toContain('Fortaleza');
    expect(texto().toLowerCase(), 'a tela entregou a resposta').not.toContain('intruso');
  });

  it('a sessão atual não oferece Encerrar, e diz que é este aparelho', () => {
    const s = invadida.sessoes.find(x => x.atual)!;
    montar(<LinhaDeSessao sessao={s} aoEncerrar={() => {}} />);
    expect(texto()).toContain('este aparelho');
    expect(porRotulo(`Encerrar a sessão em ${s.aparelho}`)).toBeUndefined();
  });

  it('e a regra de encaminhamento diz para onde ela copia', () => {
    /* É a porta que não traz o intruso de volta e é a pior de esquecer: ele
       não precisa entrar, a conta manda tudo sozinha. Sem o endereço na tela,
       não haveria como reconhecê-la. */
    const r = invadida.encaminhamentos[0];
    montar(<LinhaDeEncaminhamento regra={r} aoTirar={() => {}} />);
    expect(texto()).toContain(ENDERECO_DO_INTRUSO);
    expect(porRotulo(`Apagar a regra que copia para ${ENDERECO_DO_INTRUSO}`)).toBeDefined();
  });
});

/* ── A privacidade: o requisito 4.5 ────────────────────────────────────────── */

describe('o ajuste de privacidade diz o que decide, e oferece as opções', () => {
  const ajuste = CONTA.privacidade.find(a => a.id === 'telefones')!;

  it('o nome e a frase que explica aparecem os dois', () => {
    /* Sem a frase, "Quem pode ver os telefones cadastrados" não diz que são os
       telefones dos pais — e a decisão passa a ser sobre uma palavra. */
    montar(<LinhaDeAjuste ajuste={ajuste} aoMudar={() => {}} />);
    expect(texto()).toContain(ajuste.nome);
    expect(texto()).toContain('telefones dos pais');
  });

  it('as opções todas aparecem no select', () => {
    montar(<LinhaDeAjuste ajuste={ajuste} aoMudar={() => {}} />);
    const opcoes = [...container.querySelectorAll('option')].map(o => o.textContent);
    expect(opcoes).toEqual(ajuste.opcoes);
  });

  it('sem aoMudar o select fica desligado, e não escondido', () => {
    /* Esconder ensinaria que o programa muda de tamanho conforme a tarefa. É a
       decisão da faixa do leitor de PDF e da do Explorador. */
    montar(<LinhaDeAjuste ajuste={ajuste} />);
    const select = container.querySelector<HTMLSelectElement>('select')!;
    expect(select).not.toBeNull();
    expect(select.disabled).toBe(true);
  });
});

/* ── A consulta de vazamento: o requisito 4.4 ──────────────────────────────── */

describe('a consulta responde sobre as listas, e não dá atestado', () => {
  it('antes de consultar, não há resultado nenhum na tela', () => {
    montar(
      <CaixaDeVazamento
        endereco="" aoMudar={() => {}} aoConsultar={() => {}} achados={[]}
      />,
    );
    expect(texto()).not.toMatch(/não aparece em nenhuma/);
  });

  it('achando, mostra o serviço, o mês e o que vazou', () => {
    const achados = vazamentosDe('clubepioneiros@gmail.com');
    montar(
      <CaixaDeVazamento
        endereco="clubepioneiros@gmail.com" consultado="clubepioneiros@gmail.com"
        aoMudar={() => {}} aoConsultar={() => {}} achados={achados}
      />,
    );
    expect(texto()).toContain('Loja de Camisetas Online');
    expect(texto()).toContain('2026-04');
    expect(texto()).toContain('senha');
  });

  it('e não achando, diz o que consultou — nunca que está seguro', () => {
    /*
      É o erro mais fácil de ensinar aqui: quem recebe "nada encontrado" lê um
      atestado, e o que houve foi nenhuma lista pública ter aquele endereço.
      A tela diz **o que ela fez**, e a conclusão fica com a lição.
    */
    montar(
      <CaixaDeVazamento
        endereco="ninguem@exemplo.org" consultado="ninguem@exemplo.org"
        aoMudar={() => {}} aoConsultar={() => {}} achados={[]}
      />,
    );
    expect(texto()).toContain('listas públicas consultadas');
    for (const p of ['seguro', 'seguran', 'tudo certo', 'protegid']) {
      expect(texto().toLowerCase(), `a consulta escreveu "${p}"`).not.toContain(p);
    }
  });
});

/* ── O programa relata, e não julga a tarefa ───────────────────────────────── */

describe('nada na página fala de tarefa, lição ou exercício', () => {
  it('nem a faixa de aviso, que é a que mais tentaria', () => {
    /*
      É a regra da régua de status do Word, do painel de Problemas do Python e
      do aviso do digitalizador. Nenhuma conta de verdade escreve "seu
      exercício está incompleto" — ela diz o que detectou.

      A trava procura o vocabulário do **exercício**, e não palavras de juízo:
      a do digitalizador nasceu grossa demais e reprovou uma frase verdadeira
      do aplicativo relatando o que mediu.
    */
    montar(
      <>
        <TituloDaSecao titulo="Segurança" diz="Ajustes e recomendações para manter sua conta protegida." />
        <FaixaDaConta titulo="Atividade incomum na sua conta">
          Detectamos uma entrada de um aparelho que você não costuma usar.
        </FaixaDaConta>
        <CartaoDaConta titulo="Verificação em duas etapas" diz="Uma segunda prova de que é você.">
          <EscolhaDeMetodo aoEscolher={() => {}} />
        </CartaoDaConta>
        <LinhaDeAplicativo app={CONTA.aplicativos[0]} aoRevogar={() => {}} />
        <LinhaDeAjuste ajuste={CONTA.privacidade[0]} aoMudar={() => {}} />
      </>,
    );
    for (const p of ['tarefa', 'lição', 'exercício', 'cumprid']) {
      expect(texto().toLowerCase(), `a página escreveu "${p}"`).not.toContain(p);
    }
  });
});

/* ── A tela estreita ───────────────────────────────────────────────────────── */

describe('no celular a lateral deita, e as seções continuam', () => {
  it('a regra existe, e ela não esconde seção nenhuma', () => {
    /*
      Reduzir a tela nunca reduz o que dá para fazer nela. Escondida a lateral,
      quatro das cinco demonstrações do requisito 4 ficariam sem caminho.
      O jsdom não resolve media query nenhuma, então o que se lê é a folha.
    */
    const celular = CSS_DA_CONTA.slice(CSS_DA_CONTA.indexOf('@media (max-width: 820px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.ct-corpo');
    expect(celular).toContain('flex-direction: column');
    expect(celular).not.toMatch(/\.ct-lado[^{]*\{[^}]*display:\s*none/);
    expect(celular).not.toMatch(/\.ct-secao[^{]*\{[^}]*display:\s*none/);
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
    const principal = CSS_DA_CONTA.indexOf('[data-principal="sim"] {');
    const desligado = CSS_DA_CONTA.indexOf(':disabled,');
    expect(principal, 'a regra do principal sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'o desligado está escrito antes do principal, e perde')
      .toBeGreaterThan(principal);
  });

  it('e o desligado troca o fundo, e não só a cor da letra', () => {
    /* Só a letra deixaria o fundo azul de pé, e um retângulo azul continua
       parecendo botão por mais clara que fique a palavra dentro dele. */
    const regra = CSS_DA_CONTA.slice(CSS_DA_CONTA.indexOf(':disabled,'));
    expect(regra.slice(0, regra.indexOf('}'))).toContain('background');
  });
});
