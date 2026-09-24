// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Inbox, Send, Archive, Trash2 } from 'lucide-react';
import {
  CSS_DO_CORREIO, TopoDoCorreio, LateralDoCorreio, ListaDoCorreio, LinhaDaLista,
  BarraDaMensagem, LeituraDaMensagem, JanelinhaDeEscrever, CampoDeEndereco,
  CaixaDeConfiguracoes, DestinoDoLink, AbasDasConfiguracoes, AvisoDoCorreio,
  CampoDeDestinatarios, PeDeEscrever, VinculoDaMensagem,
} from './correio';

/*
  A janela do correio, depois do recorte.

  ── O que esta trava existe para pegar ───────────────────────────────────
  Extrair a janela de um laboratório que já está entregue é mexer numa coisa
  que funciona. O que pode sumir no caminho é uma peça — um botão que deixou
  de ser desenhado, um endereço que deixou de aparecer — e o laboratório
  continua compilando e abrindo. `CorreioLab.test.tsx` pega o que sumiu do
  **exercício**, porque ele clica nas nove tarefas; esta pega o que sumiu do
  **programa**, que é o que a próxima lição vai herdar.

  É a mesma razão de `explorer.test.tsx` e de `excel.test.tsx`.
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

const PASTAS = [
  { id: 'entrada', nome: 'Caixa de entrada', icone: Inbox, quantas: 3 },
  { id: 'enviados', nome: 'Enviados', icone: Send, quantas: 0 },
  { id: 'arquivados', nome: 'Arquivados', icone: Archive, quantas: 1 },
  { id: 'lixeira', nome: 'Lixeira', icone: Trash2 },
];

/* ── As peças estão todas lá ───────────────────────────────────────────────── */

describe('a janela do correio tem as peças que um correio tem', () => {
  it('o topo traz a marca e a caixa de pesquisa', () => {
    montar(<TopoDoCorreio />);
    expect(texto()).toContain('Correio');
    expect(texto()).toContain('Pesquisar no correio');
  });

  it('a lateral traz as pastas, com a contagem de cada uma', () => {
    montar(<LateralDoCorreio pastas={PASTAS} atual="entrada" aoTrocar={() => {}} />);
    for (const p of PASTAS) expect(texto()).toContain(p.nome);
    expect(texto()).toContain('3');
    /* A pasta aberta se lê pelo `aria-current`, e não pela cor: quem navega
       por leitor de tela precisa saber em qual está. */
    const aberta = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(aberta?.textContent).toContain('Caixa de entrada');
  });

  it('a Lixeira está na lateral mesmo sem exercício que a use', () => {
    /*
      Um programa tem todos os comandos. Uma lateral sem Lixeira seria outra
      lateral, e o desbravador que procurasse a dele no computador do clube
      não acharia o que aprendeu aqui.
    */
    montar(<LateralDoCorreio pastas={PASTAS} atual="entrada" aoTrocar={() => {}} />);
    expect(texto()).toContain('Lixeira');
  });
});

/* ── A peça aparece pela presença do setter ────────────────────────────────── */

describe('a peça só aparece quando o laboratório a entrega', () => {
  it('sem aoEscrever não há botão Escrever', () => {
    montar(<LateralDoCorreio pastas={PASTAS} atual="entrada" aoTrocar={() => {}} />);
    expect(porRotulo('Escrever')).toBeUndefined();
  });

  it('com aoEscrever, há', () => {
    montar(<LateralDoCorreio pastas={PASTAS} atual="entrada" aoTrocar={() => {}} aoEscrever={() => {}} />);
    expect(porRotulo('Escrever')).toBeDefined();
  });

  it('sem aoAbrirConfiguracoes não há engrenagem', () => {
    /* Prometer um gesto que a lição não faz é o que ensina a desconfiar do
       programa: é a regra do `aoBuscar` do Explorador. */
    montar(<TopoDoCorreio />);
    expect(porRotulo('Configurações')).toBeUndefined();
  });

  it('com aoAbrirConfiguracoes, há', () => {
    montar(<TopoDoCorreio aoAbrirConfiguracoes={() => {}} />);
    expect(porRotulo('Configurações')).toBeDefined();
  });
});

/* ── A barra da mensagem ───────────────────────────────────────────────────── */

describe('a barra da mensagem traz todos os comandos, sempre', () => {
  const TODOS = ['Voltar', 'Arquivar', 'Responder', 'Encaminhar', 'Marcar com estrela'];

  it('os cinco aparecem mesmo quando o laboratório não entrega função nenhuma', () => {
    /*
      Eles ficam **desligados**, e não escondidos. É a decisão do leitor de
      PDF e da faixa do Explorador: esconder o botão ensinaria que o programa
      muda de tamanho conforme a tarefa.
    */
    montar(<BarraDaMensagem acoes={{}} />);
    for (const r of TODOS) {
      const b = porRotulo(r);
      expect(b, `${r} sumiu da barra`).toBeDefined();
      expect(b!.disabled, `${r} deveria estar desligado`).toBe(true);
    }
  });

  it('e ligam quando ela chega', () => {
    montar(<BarraDaMensagem acoes={{
      aoVoltar: () => {}, aoArquivar: () => {}, aoResponder: () => {},
      aoEncaminhar: () => {}, aoMarcarEstrela: () => {},
    }} />);
    for (const r of TODOS) expect(porRotulo(r)!.disabled, r).toBe(false);
  });
});

/* ── A mensagem aberta ─────────────────────────────────────────────────────── */

describe('a mensagem aberta mostra o endereço inteiro', () => {
  it('o domínio de quem mandou aparece ao lado do nome', () => {
    /*
      É a premissa do requisito 5 da CC-ES005: o primeiro indício de uma
      mensagem fraudulenta é o domínio de quem a mandou. Um correio que
      mostrasse só o nome de exibição apagaria esse indício da tela, e a lição
      passaria a pedir que se apontasse o que não está à vista.
    */
    montar(
      <LeituraDaMensagem
        assunto="URGENTE: sua conta será bloqueada"
        deNome="Banco do Brasil"
        de="seguranca@bancodobrasil-verificacao.com"
        corpo="Confirme seus dados agora."
      />,
    );
    expect(texto()).toContain('Banco do Brasil');
    expect(texto()).toContain('seguranca@bancodobrasil-verificacao.com');
  });

  it('e o anexo aparece com o nome do arquivo', () => {
    montar(
      <LeituraDaMensagem assunto="a" deNome="b" de="c@d.e" corpo="f"
        anexos={['boleto-atualizado.pdf.exe']} />,
    );
    expect(texto()).toContain('boleto-atualizado.pdf.exe');
  });
});

/* ── A lista ───────────────────────────────────────────────────────────────── */

describe('a linha da lista é botão só quando dá para abrir', () => {
  it('com aoAbrir, é botão', () => {
    montar(<ListaDoCorreio><LinhaDaLista de="Secretaria" assunto="Escala" aoAbrir={() => {}} /></ListaDoCorreio>);
    expect(container.querySelector('button.co-linha')).not.toBeNull();
  });

  it('sem aoAbrir, não é', () => {
    /* A pasta de enviados não abre mensagem. Uma linha com cara de clicável
       prometeria um gesto que o programa não tem ali. */
    montar(<ListaDoCorreio><LinhaDaLista de="Para: alguém" assunto="Aviso" /></ListaDoCorreio>);
    expect(container.querySelector('button.co-linha')).toBeNull();
    expect(container.querySelector('div.co-linha')).not.toBeNull();
  });

  it('a lista vazia diz o que falta, e não fica em branco', () => {
    montar(<ListaDoCorreio vazia="Nada arquivado ainda." />);
    expect(texto()).toContain('Nada arquivado ainda.');
  });

  it('e o assunto em branco sai escrito, em vez de sumir', () => {
    montar(<ListaDoCorreio><LinhaDaLista de="Para: alguém" assunto="" /></ListaDoCorreio>);
    expect(texto()).toContain('(sem assunto)');
  });
});

/* ── A janelinha e as configurações ────────────────────────────────────────── */

describe('a janelinha de escrever e a caixa de configurações', () => {
  it('a janelinha tem por onde descartar', () => {
    montar(<JanelinhaDeEscrever aoDescartar={() => {}}><p>miolo</p></JanelinhaDeEscrever>);
    expect(porRotulo('Descartar a mensagem')).toBeDefined();
    expect(texto()).toContain('Nova mensagem');
  });

  it('o campo de endereço se acha pelo rótulo que ele mostra', () => {
    montar(<CampoDeEndereco rotulo="Cco" valor="a@b.c" aoMudar={() => {}} />);
    const campo = container.querySelector<HTMLInputElement>('input[aria-label="Cco"]');
    expect(campo?.value).toBe('a@b.c');
  });

  it('as configurações têm por onde voltar', () => {
    montar(
      <CaixaDeConfiguracoes titulo="Assinatura" aoVoltar={() => {}}>
        <p>miolo</p>
      </CaixaDeConfiguracoes>,
    );
    expect(porRotulo('Voltar para o correio')).toBeDefined();
    expect(texto()).toContain('Assinatura');
  });
});

/* ── Nenhuma peça guarda estado ────────────────────────────────────────────── */

describe('a janela não guarda estado nenhum', () => {
  it('a pasta aberta é a que o chamador diz, e clicar não a muda sozinha', () => {
    /*
      Uma lateral com pasta própria obrigaria os dois lados a concordar sobre
      a mesma pasta, que é a forma mais rápida de mostrarem coisas diferentes.
      Quem guarda é o laboratório, que é quem responde à verificação.
    */
    montar(<LateralDoCorreio pastas={PASTAS} atual="arquivados" aoTrocar={() => {}} />);
    const antes = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(antes?.textContent).toContain('Arquivados');

    act(() => {
      botoes().find(b => b.textContent?.includes('Caixa de entrada'))
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const depois = botoes().find(b => b.getAttribute('aria-current') === 'true');
    expect(depois?.textContent, 'a lateral mudou de pasta por conta própria').toContain('Arquivados');
  });
});

/* ── A tela estreita ───────────────────────────────────────────────────────── */

describe('no celular a lateral vira fileira, e as pastas continuam', () => {
  it('a regra existe, e ela não esconde pasta nenhuma', () => {
    /*
      Reduzir a tela nunca reduz o que dá para fazer nela. A coluna de 190px
      ao lado da lista deixaria a mensagem sem largura, e ler a mensagem é o
      que o requisito 5 pede — então ela deita, e nenhuma pasta sai.

      O jsdom não resolve media query nenhuma, então o que se lê é a folha.
    */
    const celular = CSS_DO_CORREIO.slice(CSS_DO_CORREIO.indexOf('@media (max-width: 720px)'));
    expect(celular, 'a regra do celular sumiu da folha').toContain('.co-corpo');
    expect(celular).toContain('flex-direction: column');
    expect(celular).not.toMatch(/\.co-pasta[^{]*\{[^}]*display:\s*none/);
    expect(celular).not.toMatch(/\.co-lado[^{]*\{[^}]*display:\s*none/);
  });
});

/* ── O link disfarçado ─────────────────────────────────────────────────────── */

describe('o link mostra um texto e vai para outro lugar', () => {
  /*
    É o indício mais comum de uma mensagem fraudulenta, e o único que não se vê
    sem parar o ponteiro em cima. Um correio que não desenhasse links, ou que
    escrevesse o destino ao lado do texto, apagaria da tela o gesto que o
    requisito 5 da CC-ES005 manda fazer.
  */
  const LINKS = [{ texto: 'bancodobrasil.com.br', para: 'http://bb-verificacao.xyz/entrar' }];

  it('o texto do link é o que se lê, e o destino não vai escrito ao lado', () => {
    montar(
      <LeituraDaMensagem
        assunto="a" deNome="b" de="c@d.e" corpo="Confirme seus dados:"
        links={LINKS}
      />,
    );
    expect(texto()).toContain('bancodobrasil.com.br');
    expect(texto(), 'o destino de verdade foi impresso junto do texto')
      .not.toContain('bb-verificacao.xyz');
  });

  it('e ele está no href, que é de onde o navegador tira a barra de baixo', () => {
    montar(
      <LeituraDaMensagem assunto="a" deNome="b" de="c@d.e" corpo="x" links={LINKS} />,
    );
    const a = container.querySelector<HTMLAnchorElement>('a.co-link')!;
    expect(a.getAttribute('href')).toBe(LINKS[0].para);
  });

  it('apontar o link avisa o laboratório para onde ele vai', () => {
    /* E também pelo foco, não só pelo ponteiro: quem navega por teclado não
       passa o mouse em lugar nenhum, e o indício não pode sumir para ele. */
    const apontou: (string | undefined)[] = [];
    montar(
      <LeituraDaMensagem
        assunto="a" deNome="b" de="c@d.e" corpo="x" links={LINKS}
        aoApontarLink={p => apontou.push(p)}
      />,
    );
    const a = container.querySelector('a.co-link')!;
    act(() => { a.dispatchEvent(new MouseEvent('pointerover', { bubbles: true })); });
    act(() => { a.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); });
    act(() => { (a as HTMLElement).focus(); });
    expect(apontou, 'apontar o link não avisou ninguém').toContain(LINKS[0].para);
  });

  it('e a barra de destino desenha o endereço inteiro quando há um', () => {
    montar(<DestinoDoLink para="http://bb-verificacao.xyz/entrar" />);
    expect(texto()).toContain('http://bb-verificacao.xyz/entrar');

    montar(<DestinoDoLink />);
    expect(container.querySelector('.co-destino')).toBeNull();
  });

  it('clicar no link não navega para fora da plataforma', () => {
    /* A simulação tem de aguentar curiosidade, e curiosidade aqui é clicar no
       link do golpe — que é o gesto que a lição existe para desaconselhar.
       Sair da plataforma levaria o desbravador para um site de verdade. */
    montar(<LeituraDaMensagem assunto="a" deNome="b" de="c@d.e" corpo="x" links={LINKS} />);
    const a = container.querySelector('a.co-link')!;
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    act(() => { a.dispatchEvent(ev); });
    expect(ev.defaultPrevented, 'o clique no link do golpe não foi barrado').toBe(true);
  });
});

/* ── As peças que a CC-ES007 trouxe ────────────────────────────────────────── */

describe('a caixa de pesquisa vira campo pela presença de aoBuscar', () => {
  it('sem ele ela continua sendo o enfeite que a AP044 e a CC-ES005 têm', () => {
    /*
      É a regra do `aoBuscar` do Explorador, e estava escrita neste arquivo
      desde o primeiro dia sem caso nenhum. O requisito 4.3 da CC-ES007 é o
      caso: achar na busca o que foi arquivado é a diferença entre arquivar e
      excluir, e sem campo de verdade não há como mostrá-la.
    */
    montar(<TopoDoCorreio />);
    expect(container.querySelector('input')).toBeNull();
    expect(texto()).toContain('Pesquisar no correio');
  });

  it('com ele, o que se digita chega ao laboratório', () => {
    let termo = '';
    montar(<TopoDoCorreio busca="" aoBuscar={t => { termo = t; }} />);
    const campo = container.querySelector('input') as HTMLInputElement;
    expect(campo).toBeTruthy();
    const setar = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setar.call(campo, 'salão');
      campo.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(termo, 'o que se digitou na busca não chegou ao laboratório').toBe('salão');
  });
});

describe('o campo que aguenta cinquenta e dois endereços', () => {
  const CINQUENTA = Array.from({ length: 52 }, (_, i) => `familia${i + 1}@exemplo.com`);

  it('mostra as primeiras e diz quantas faltam', () => {
    /*
      É o que todo correio faz, e é a razão de o vazamento passar
      despercebido: ninguém vê os cinquenta e um endereços, vê "e mais 49".
    */
    montar(<CampoDeDestinatarios rotulo="Cco" enderecos={CINQUENTA} />);
    expect(container.querySelectorAll('.co-ficha')).toHaveLength(3);
    expect(texto()).toContain('e mais 49');
  });

  it('e com três não diz que faltam', () => {
    montar(<CampoDeDestinatarios rotulo="Para" enderecos={CINQUENTA.slice(0, 3)} />);
    expect(texto()).not.toContain('e mais');
  });

  it('tirar e acrescentar só aparecem quando alguém os atende', () => {
    montar(<CampoDeDestinatarios rotulo="Para" enderecos={CINQUENTA.slice(0, 2)} />);
    expect(botoes()).toHaveLength(0);
    expect(container.querySelector('input')).toBeNull();

    act(() => root.render(<CampoDeDestinatarios rotulo="Para" enderecos={CINQUENTA.slice(0, 2)}
      aoTirar={() => {}} aoAcrescentar={() => {}} />));
    expect(botoes()).toHaveLength(2);
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('Enter acrescenta o endereço e limpa o campo', () => {
    let posto = '';
    montar(<CampoDeDestinatarios rotulo="Para" enderecos={[]}
      aoAcrescentar={e => { posto = e; }} />);
    const campo = container.querySelector('input') as HTMLInputElement;
    const setar = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value')!.set!;
    act(() => { setar.call(campo, ' tio.samuel@clubepioneiros.org.br '); });
    act(() => {
      campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(posto).toBe('tio.samuel@clubepioneiros.org.br');
    expect(campo.value).toBe('');
  });
});

describe('o pé de escrever e o vínculo', () => {
  it('anexar e inserir vínculo ficam lado a lado, e é isso que faz a escolha', () => {
    /* Os dois botões estão ali, e nada na tela diz qual usar — que é o que
       faz o requisito 4.2 ser uma escolha e não uma instrução. */
    montar(<PeDeEscrever aoEnviar={() => {}} aoAnexar={() => {}} aoInserirVinculo={() => {}} />);
    expect(porRotulo('Anexar arquivo')).toBeTruthy();
    expect(porRotulo('Inserir vínculo de arquivo')).toBeTruthy();
  });

  it('Enviar fica desligado quando o laboratório diz que ainda não dá', () => {
    montar(<PeDeEscrever aoEnviar={() => {}} podeEnviar={false} />);
    const enviar = botoes().find(b => b.textContent === 'Enviar') as HTMLButtonElement;
    expect(enviar.disabled).toBe(true);
  });

  it('o vínculo mostra quem consegue abrir, que é a metade que ninguém conta', () => {
    /* Mandar um vínculo que a pessoa não abre troca um problema barulhento por
       um quieto: ela clica, cai em "solicitar acesso", e o pedido espera numa
       caixa que você não lê. O anexo grande pelo menos volta com erro. */
    montar(<VinculoDaMensagem nome="Fotos do acampamento"
      quemAbre="Só você consegue abrir" />);
    expect(texto()).toContain('Só você consegue abrir');
  });
});

describe('as abas das configurações e o aviso do provedor', () => {
  it('as abas existem todas, mesmo na lição que usa uma', () => {
    /* Um correio que só mostrasse "Resposta automática" na lição da resposta
       automática ensinaria a procurar o botão que a tarefa quer. */
    montar(<AbasDasConfiguracoes atual="geral" aoTrocar={() => {}} abas={[
      { id: 'geral', nome: 'Geral' },
      { id: 'listas', nome: 'Listas' },
      { id: 'ausencia', nome: 'Resposta automática' },
    ]} />);
    expect(botoes()).toHaveLength(3);
    expect(container.querySelectorAll('.co-aba[aria-pressed="true"]')).toHaveLength(1);
  });

  it('o aviso diz o que o correio sabe, e quem escreve o texto é o laboratório', () => {
    /* "O anexo passa de 25 MB" é do provedor; "sua lição está errada" seria
       nosso. É a regra da régua de status do Word. */
    montar(<AvisoDoCorreio tom="ruim">O anexo passa de 25 MB e a mensagem voltou.</AvisoDoCorreio>);
    expect(container.querySelector('.co-aviso[data-tom="ruim"]')).toBeTruthy();
  });
});

describe('a folha, depois das peças novas', () => {
  it('a regra do desligado vem depois da do primário, e troca o fundo', () => {
    /*
      Mesma especificidade: escrita antes, ela perde, e o botão primário
      desligado sai azul e branco, com cara de clicável. É a quarta vez na
      plataforma, e nada estoura quando a ordem está errada.
    */
    const primario = CSS_DO_CORREIO.indexOf('.co-bt.primario {');
    const desligado = CSS_DO_CORREIO.indexOf('.co-bt:disabled');
    expect(primario, 'a regra do primário sumiu da folha').toBeGreaterThan(-1);
    expect(desligado, 'a regra do desligado sumiu da folha').toBeGreaterThan(primario);

    const regra = CSS_DO_CORREIO.slice(desligado);
    expect(regra.slice(0, regra.indexOf('}'))).toContain('background');
  });
});
