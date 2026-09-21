// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Inbox, Send, Archive, Trash2 } from 'lucide-react';
import {
  CSS_DO_CORREIO, TopoDoCorreio, LateralDoCorreio, ListaDoCorreio, LinhaDaLista,
  BarraDaMensagem, LeituraDaMensagem, JanelinhaDeEscrever, CampoDeEndereco,
  CaixaDeConfiguracoes,
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
