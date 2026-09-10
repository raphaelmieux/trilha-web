// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import CorreioLab from './CorreioLab';
import { METAS_DO_CORREIO, FAMILIAS, DIRETOR, SECRETARIA } from './correioDoClube';

/*
  O correio do clube, percorrido clicando.

  O que este arquivo alcança e o modelo não: a janelinha de escrever. Ela é onde
  quase tudo acontece — os três campos, o anexo, a lista do clube, a conferência
  e o envio —, e é onde a ligação entre o botão e a mensagem tem mais como estar
  errada. Um Cco que não aparece porque ninguém clicou em "Cc Cco" deixa a
  tarefa impossível de vencer sem nada na tela explicando.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <CorreioLab
          specialtyCode="AP044" lessonCode="AP044.7-L2"
          lessonTitle="Escrevendo o aviso do acampamento"
          requirementCodes={['AP044-11.1']}
          userId="00000000-0000-0000-0000-000000000000" />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);

const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const feitas = (): string[] => {
  const verdes: string[] = [];
  for (const m of METAS_DO_CORREIO) {
    const titulo = [...container.querySelectorAll('p')].find(e => e.textContent?.trim() === m.titulo);
    if (!titulo) continue;
    const linha = titulo.parentElement?.parentElement;
    if (linha?.firstElementChild?.textContent === '✓') verdes.push(m.id);
  }
  return verdes;
};

const placar = () => container.textContent?.match(/(\d+) de (\d+) concluídas/)?.slice(1, 3);

/*
  Abre uma mensagem da caixa de entrada.

  Volta para a lista antes, se houver outra mensagem aberta: depois de enviar
  uma resposta o correio continua na conversa — como o de verdade faz —, e de lá
  a caixa de entrada só se alcança pelo Voltar.
*/
const abrirMensagem = (assunto: string) => {
  const voltar = porRotulo('Voltar');
  if (voltar) clicar(voltar, 'Voltar para a caixa de entrada');
  clicar(porRotulo(`Abrir: ${assunto}`), `mensagem "${assunto}"`);
};

const configurarAssinatura = () => {
  clicar(porRotulo('Configurações'), 'Configurações');
  escrever(porRotulo('Texto da assinatura'),
    'Ana Beatriz Rocha\nSecretária — Clube Pioneiros', 'assinatura');
  clicar([...container.querySelectorAll('button')].find(b => b.textContent?.includes('Salvar alterações')), 'Salvar');
};

describe('o correio do clube se resolve clicando', () => {
  it('abre com as nove por fazer e a caixa de entrada cheia', () => {
    expect(placar()).toEqual(['0', '9']);
    expect(feitas()).toEqual([]);
    expect(container.querySelectorAll('.co-linha').length).toBeGreaterThanOrEqual(3);
  });

  it('fecha as nove seguindo o que o painel manda', () => {
    // 5 — a assinatura primeiro, para entrar nas mensagens seguintes
    configurarAssinatura();

    // 1, 2, 3, 4 e 6 — o aviso do acampamento
    clicar(porRotulo('Escrever'), 'Escrever');
    escrever(porRotulo('Para'), SECRETARIA, 'Para');
    clicar(porRotulo('Mostrar Cc e Cco'), 'Cc Cco');
    escrever(porRotulo('Cc'), DIRETOR, 'Cc');
    clicar(porRotulo('Trazer a lista do clube'), 'lista do clube');
    escrever(porRotulo('Assunto'), 'Acampamento de inverno', 'Assunto');
    escrever(porRotulo('Corpo da mensagem'), 'Segue a autorização em anexo.', 'corpo');
    clicar(porRotulo('Anexar arquivo'), 'clipe');

    clicar(porRotulo('Conferir antes de enviar'), 'Conferir');
    expect(container.textContent).toContain('Cada pessoa vai ver');

    clicar(porRotulo('Enviar'), 'Enviar');
    for (const id of ['para', 'copia', 'oculta', 'anexo', 'assinatura', 'enviar']) {
      expect(feitas(), `${id} não fechou`).toContain(id);
    }

    // 7 — arquivar
    abrirMensagem('Escala das unidades — já resolvido');
    clicar(porRotulo('Arquivar'), 'Arquivar');
    expect(feitas()).toContain('arquivar');

    // 8 — responder
    abrirMensagem('Confirmação do ônibus');
    clicar(porRotulo('Responder'), 'Responder');
    expect((porRotulo('Para') as HTMLInputElement).value, 'Responder não preencheu o Para').toBe(SECRETARIA);
    escrever(porRotulo('Corpo da mensagem'), 'Confirmado, obrigada!', 'corpo');
    clicar(porRotulo('Enviar'), 'Enviar');
    expect(feitas()).toContain('responder');

    // 9 — encaminhar
    abrirMensagem('Valor das diárias');
    clicar(porRotulo('Encaminhar'), 'Encaminhar');
    expect(container.textContent, 'o encaminhamento não trouxe o histórico').toContain('Mensagem encaminhada');
    escrever(porRotulo('Para'), DIRETOR, 'Para');
    escrever(porRotulo('Corpo da mensagem'), 'Segue para conhecimento.', 'corpo');
    clicar(porRotulo('Enviar'), 'Enviar');

    const abertas = METAS_DO_CORREIO.map(m => m.id).filter(id => !feitas().includes(id));
    expect(abertas, `${abertas.join(', ')} continuam vermelhas depois de fazer tudo`).toEqual([]);
    expect(placar()).toEqual(['9', '9']);
  });

  /*
    Enviar errado não é bloqueado — é mostrado.

    A prévia diz, antes do clique, quantos endereços cada pessoa vai ver. Depois
    do clique a mensagem está enviada, a tarefa continua vermelha, e o jeito de
    consertar é escrever de novo. Simulação que vira muro no primeiro desvio
    ensina a andar no trilho.
  */
  it('a lista no Para vaza, o correio avisa, e a tarefa não fecha', () => {
    clicar(porRotulo('Escrever'), 'Escrever');
    escrever(porRotulo('Para'), FAMILIAS.slice(0, 8).join(', '), 'Para');
    escrever(porRotulo('Assunto'), 'Acampamento', 'Assunto');

    clicar(porRotulo('Conferir antes de enviar'), 'Conferir');
    expect(container.textContent).toContain('Cada pessoa vai ver 8 endereços');

    clicar(porRotulo('Enviar'), 'Enviar');
    expect(container.textContent).toContain('endereços à vista');
    expect(feitas(), 'a lista no Para fechou a tarefa do Cco').not.toContain('oculta');
    /* Enviar aconteceu: o que sai não volta. */
    expect(feitas()).toContain('enviar');
  });

  /* A assinatura configurada aparece na janelinha de escrever, e é assim que se
     vê que ela vai entrar sozinha. */
  it('a assinatura configurada aparece na próxima mensagem', () => {
    clicar(porRotulo('Escrever'), 'Escrever');
    expect(container.querySelector('.co-assinatura')).toBeNull();
    clicar(porRotulo('Descartar a mensagem'), 'descartar');

    configurarAssinatura();
    clicar(porRotulo('Escrever'), 'Escrever');
    expect(container.querySelector('.co-assinatura')?.textContent).toContain('Secretária');
  });

  /* Arquivar não é excluir: a mensagem some da entrada e aparece em Arquivados. */
  it('arquivar tira da entrada e guarda em Arquivados', () => {
    const antes = container.querySelectorAll('.co-linha').length;
    abrirMensagem('Escala das unidades — já resolvido');
    clicar(porRotulo('Arquivar'), 'Arquivar');
    expect(container.querySelectorAll('.co-linha').length).toBe(antes - 1);

    clicar([...container.querySelectorAll('.co-pasta')].find(b => b.textContent?.includes('Arquivados')), 'Arquivados');
    expect(container.textContent).toContain('Escala das unidades');
  });

  /* Sem destinatário nenhum não há para quem enviar, e o correio diz isso. */
  it('enviar sem destinatário explica em vez de enviar', () => {
    clicar(porRotulo('Escrever'), 'Escrever');
    escrever(porRotulo('Assunto'), 'Teste', 'Assunto');
    clicar(porRotulo('Enviar'), 'Enviar');
    expect(container.textContent).toContain('Não há para quem enviar');
    expect(feitas()).not.toContain('enviar');
  });
});
