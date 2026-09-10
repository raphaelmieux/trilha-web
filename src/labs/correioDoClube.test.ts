import { describe, it, expect } from 'vitest';
import {
  CORREIO_INICIAL, METAS_DO_CORREIO, FAMILIAS, DIRETOR, SECRETARIA,
  naCaixaDeEntrada, enderecosVisiveis,
  type Correio, type Enviada,
} from './correioDoClube';

/*
  O laboratório de correio abre com tudo por fazer.

  A caixa de entrada chega com três mensagens, e é a forma mais fácil de
  escrever uma tarefa que nasce verde: "arquivar" e "responder" olhariam para
  uma caixa que já parece movimentada. O que não existe é o que o requisito
  cobra — nenhuma mensagem enviada, nenhuma arquivada, nenhuma assinatura.
*/

describe('nenhuma tarefa do laboratório de correio nasce verde', () => {
  it('o correio abre com as nove por fazer', () => {
    const verdes = METAS_DO_CORREIO.filter(m => m.feita(CORREIO_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas no correio inicial`).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DO_CORREIO.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem).toEqual([]);
  });

  it('há uma tarefa para cada um dos nove itens do requisito 11', () => {
    expect(METAS_DO_CORREIO).toHaveLength(9);
    expect(new Set(METAS_DO_CORREIO.map(m => m.id)).size).toBe(9);
  });

  it('e a caixa de entrada tem mensagem para arquivar, responder e encaminhar', () => {
    expect(naCaixaDeEntrada(CORREIO_INICIAL).length).toBeGreaterThanOrEqual(3);
    expect(CORREIO_INICIAL.caixa.every(m => !m.arquivada)).toBe(true);
    expect(CORREIO_INICIAL.enviadas).toEqual([]);
    expect(CORREIO_INICIAL.assinatura).toBe('');
  });
});

/* ── O correio depois de tudo feito ────────────────────────────────────────── */

const aviso = (extra: Partial<Enviada> = {}): Enviada => ({
  para: [SECRETARIA], cc: [DIRETOR], cco: FAMILIAS,
  assunto: 'Acampamento de inverno', corpo: 'Segue a autorização em anexo.',
  anexos: ['autorizacao-acampamento.pdf'], comAssinatura: true, origem: 'novo',
  ...extra,
});

const pronto = (): Correio => ({
  caixa: CORREIO_INICIAL.caixa.map((m, i) => (i === 1 ? { ...m, arquivada: true } : m)),
  assinatura: 'Ana Beatriz Rocha\nSecretária — Clube Pioneiros',
  enviadas: [
    aviso(),
    { ...aviso({ cco: [], cc: [] }), para: [SECRETARIA], origem: 'resposta', corpo: 'Confirmado, obrigada!' },
    { ...aviso({ cco: [], cc: [] }), para: [DIRETOR], origem: 'encaminhamento', historico: '--- Mensagem encaminhada ---' },
  ],
});

describe('toda tarefa do laboratório de correio tem como ser vencida', () => {
  it('o correio pronto fecha as nove', () => {
    const abertas = METAS_DO_CORREIO.filter(m => !m.feita(pronto())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas num correio pronto`).toEqual([]);
  });
});

/*
  Cco não é "o terceiro campo".

  Uma mensagem com uma família no Cco e as outras cinquenta e nove no Para tem o
  campo preenchido e vazou tudo. O que a tarefa mede é o vazamento **não** ter
  acontecido — e é por isso que ela olha para quantos endereços ficam visíveis, e
  não para o Cco estar vazio ou não.
*/
describe('o que a tarefa do Cco realmente mede', () => {
  const meta = METAS_DO_CORREIO.find(m => m.id === 'oculta')!;

  it('a lista grande no Para não fecha, mesmo com o Cco preenchido', () => {
    const vazada: Correio = {
      ...pronto(),
      enviadas: [aviso({ para: FAMILIAS, cco: [DIRETOR, SECRETARIA, 'outro@exemplo.com'] })],
    };
    expect(enderecosVisiveis(vazada.enviadas[0]).length).toBeGreaterThanOrEqual(60);
    expect(meta.feita(vazada)).toBe(false);
  });

  it('a lista grande no Cc também não', () => {
    const vazada: Correio = { ...pronto(), enviadas: [aviso({ cc: FAMILIAS, cco: FAMILIAS })] };
    expect(meta.feita(vazada)).toBe(false);
  });

  it('e a lista no Cco fecha', () => {
    expect(meta.feita(pronto())).toBe(true);
  });

  /* Uma família só no Cco não é "avisar um grupo", e não demonstra nada. */
  it('um endereço só no Cco não fecha', () => {
    const uma: Correio = { ...pronto(), enviadas: [aviso({ cco: [FAMILIAS[0]] })] };
    expect(meta.feita(uma)).toBe(false);
  });
});

/*
  A assinatura configurada e nunca usada não demonstra nada.

  É a mesma família do "zero link não é zero link quebrado": a tarefa poderia
  ser satisfeita por um texto guardado que nunca saiu numa mensagem.
*/
describe('a assinatura precisa ter saído numa mensagem', () => {
  const meta = METAS_DO_CORREIO.find(m => m.id === 'assinatura')!;

  it('configurada e nunca usada não fecha', () => {
    const so: Correio = { ...CORREIO_INICIAL, assinatura: 'Ana Beatriz Rocha — Secretária' };
    expect(meta.feita(so)).toBe(false);
  });

  it('usada sem estar configurada também não', () => {
    const so: Correio = { ...CORREIO_INICIAL, enviadas: [aviso({ comAssinatura: true })] };
    expect(meta.feita(so)).toBe(false);
  });

  it('e uma assinatura de uma palavra não conta', () => {
    const curta: Correio = { ...pronto(), assinatura: 'Ana' };
    expect(meta.feita(curta)).toBe(false);
  });
});

/* Arquivar tira da caixa de entrada e guarda — a mensagem continua existindo. */
describe('arquivar não é excluir', () => {
  it('a mensagem arquivada sai da caixa de entrada e continua no correio', () => {
    const c = pronto();
    expect(naCaixaDeEntrada(c).length).toBe(c.caixa.length - 1);
    expect(c.caixa).toHaveLength(CORREIO_INICIAL.caixa.length);
  });
});

/* Responder e encaminhar são gestos diferentes, e o modelo os distingue pela
   origem — não pelo destinatário, que pode coincidir. */
describe('responder e encaminhar não se confundem', () => {
  it('uma resposta vazia não fecha a tarefa de responder', () => {
    const c: Correio = { ...pronto(), enviadas: [{ ...aviso(), origem: 'resposta', corpo: '' }] };
    expect(METAS_DO_CORREIO.find(m => m.id === 'responder')!.feita(c)).toBe(false);
  });

  it('e um encaminhamento sem destinatário no Para também não', () => {
    const c: Correio = { ...pronto(), enviadas: [{ ...aviso(), origem: 'encaminhamento', para: [] }] };
    expect(METAS_DO_CORREIO.find(m => m.id === 'encaminhar')!.feita(c)).toBe(false);
  });
});

/* A lista do clube precisa ser grande de verdade: com três famílias, "todo
   mundo vê todo mundo" não assusta ninguém. */
describe('a lista do clube é grande', () => {
  it('tem sessenta endereços, todos diferentes', () => {
    expect(FAMILIAS).toHaveLength(60);
    expect(new Set(FAMILIAS).size).toBe(60);
  });
});
