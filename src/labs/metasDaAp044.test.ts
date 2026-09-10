import { describe, it, expect } from 'vitest';
import {
  DOC_INICIAL, METAS_DOS_ESTILOS, TEXTO_DO_SITE,
  aplicarCaixa, sumarioAtualizado, titulosDoDoc, textoDoBloco,
  type Doc, type Bloco, type Trecho,
} from './metasDaAp044';

/*
  O laboratório de estilos da AP044 abre com tudo por fazer.

  A trava é a mesma de `metasDaAp043.test.ts`, e existe pela mesma razão: das
  três vezes em que um laboratório desta plataforma abriu resolvido, o erro foi
  invisível de dentro — o painel mostra tarefas concluídas, que é exatamente o
  que se espera de um laboratório funcionando.

  Aqui o risco é maior do que o de costume, e é preciso dizer por quê. Este
  documento **chega escrito por inteiro**: título, três seções, oito itens de
  lista, versículo. Na tela ele parece um manual pronto, e é fácil escrever a
  meta olhando para o texto em vez de olhar para o estilo dele. O que falta não
  se vê: nenhum parágrafo é Título coisa nenhuma, e é por isso que o sumário sai
  vazio.
*/

describe('nenhuma tarefa do laboratório de estilos nasce verde', () => {
  it('o manual abre com as nove por fazer', () => {
    const verdes = METAS_DOS_ESTILOS.filter(m => m.feita(DOC_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas no documento inicial`).toEqual([]);
  });

  it('e o sumário do documento inicial sairia vazio, que é a lição', () => {
    expect(titulosDoDoc(DOC_INICIAL)).toEqual([]);
  });

  it('toda meta tem passo a passo, para quem travar', () => {
    const sem = METAS_DOS_ESTILOS.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem, `${sem.join(', ')} não oferecem caminho a quem travar`).toEqual([]);
  });

  /* Nove itens no requisito, nove tarefas. Uma meta a menos é um item que
     ninguém demonstra, e ninguém repara: o painel fecha verde igual. */
  it('há uma tarefa para cada um dos nove itens do requisito 7', () => {
    expect(METAS_DOS_ESTILOS).toHaveLength(9);
    expect(new Set(METAS_DOS_ESTILOS.map(m => m.id)).size).toBe(9);
  });
});

/* ── O manual pronto ───────────────────────────────────────────────────────── */

const mudarBloco = (d: Doc, id: string, mudanca: Partial<Bloco>): Doc =>
  ({ ...d, blocos: d.blocos.map(b => (b.id === id ? { ...b, ...mudanca } : b)) });

const mudarTrecho = (d: Doc, id: string, mudanca: Partial<Trecho>): Doc => ({
  ...d,
  blocos: d.blocos.map(b => ({
    ...b,
    trechos: b.trechos.map(x => (x.id === id ? { ...x, ...mudanca } : x)),
  })),
});

const colar = (d: Doc, id: string, secao: Bloco['secao'], deFora: boolean): Doc => ({
  ...d,
  blocos: [...d.blocos, {
    id, secao, estilo: 'Normal' as const,
    trechos: [{ id: `${id}-a`, texto: TEXTO_DO_SITE, posicao: 'normal' as const, realce: 'nenhum' as const, enfase: false, deFora }],
  }],
});

/** O manual como ele fica quando o desbravador faz tudo o que o painel pede. */
function manualPronto(): Doc {
  let d: Doc = DOC_INICIAL;
  d = mudarBloco(d, 'titulo', { estilo: 'Título 1' });
  for (const h of ['h-levar', 'h-prog', 'h-culto']) d = mudarBloco(d, h, { estilo: 'Título 2' });
  d = mudarBloco(d, 'citacao', { estilo: 'Citação' });
  d = mudarTrecho(d, 'prazo-b', { enfase: true, realce: 'amarelo' });
  d = mudarBloco(d, 'titulo', {
    trechos: [{ ...d.blocos.find(b => b.id === 'titulo')!.trechos[0], texto: aplicarCaixa('MANUAL DO ACAMPAMENTO DE INVERNO', 'frase') }],
  });
  d = colar(d, 'colado-site', 'programacao', true);
  d = colar(d, 'colado-doc', 'fim', false);
  d = mudarTrecho(d, 'lev-7-b', { posicao: 'sobrescrito' });
  d = mudarTrecho(d, 'lev-2-b', { posicao: 'subscrito' });
  d = { ...d, colunas: { ...d.colunas, levar: 2 } };
  d = mudarBloco(d, 'lev-1', { nota: 'Espuma fina que fica entre o saco de dormir e o chão.' });
  return { ...d, sumario: titulosDoDoc(d) };
}

describe('toda tarefa do laboratório de estilos tem como ser vencida', () => {
  it('o manual pronto fecha as nove', () => {
    const abertas = METAS_DOS_ESTILOS.filter(m => !m.feita(manualPronto())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas num manual pronto`).toEqual([]);
  });

  it('e o título consertado é exatamente o que a tarefa pede', () => {
    const b = manualPronto().blocos.find(x => x.id === 'titulo')!;
    expect(textoDoBloco(b)).toBe('Manual do acampamento de inverno');
  });
});

/*
  O sumário guarda o que leu, e é essa a metade da lição que ninguém conta.

  No Word ele não se refaz sozinho: trocar um título depois de gerar deixa o
  sumário mostrando o texto velho, e nada na tela avisa. Se a meta apenas
  conferisse "existe sumário", o desbravador entregaria um manual cujo sumário
  diz MANUAL DO ACAMPAMENTO DE INVERNO em caixa alta, e a plataforma daria por
  bom.
*/
describe('o sumário envelhece quando um título muda', () => {
  it('gerar antes de consertar o título deixa o sumário desatualizado', () => {
    let d: Doc = DOC_INICIAL;
    d = mudarBloco(d, 'titulo', { estilo: 'Título 1' });
    for (const h of ['h-levar', 'h-prog', 'h-culto']) d = mudarBloco(d, h, { estilo: 'Título 2' });
    d = { ...d, sumario: titulosDoDoc(d) };
    expect(sumarioAtualizado(d)).toBe(true);

    /* Agora o Caps Lock é consertado — e o sumário não fica sabendo. */
    d = mudarBloco(d, 'titulo', {
      trechos: [{ ...d.blocos.find(b => b.id === 'titulo')!.trechos[0], texto: 'Manual do acampamento de inverno' }],
    });
    expect(sumarioAtualizado(d)).toBe(false);
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(false);

    /* Atualizar é o que o alcança. */
    d = { ...d, sumario: titulosDoDoc(d) };
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(true);
  });

  it('sumário gerado sem estilo nenhum sai vazio, e vazio não vale', () => {
    const d: Doc = { ...DOC_INICIAL, sumario: titulosDoDoc(DOC_INICIAL) };
    expect(d.sumario).toEqual([]);
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(false);
  });
});

/*
  Os cinco modos do botão Aa.

  Escrevê-los de cabeça erra por pouco e com frequência — e quem confere o
  próprio título contra um exemplo errado conclui que o **seu** documento é que
  está errado. Cada modo aqui é o que o Word produz.
*/
describe('o botão Aa faz o que o Word faz', () => {
  const T = 'MANUAL DO ACAMPAMENTO DE INVERNO';

  it('primeira letra da frase em maiúscula', () => {
    expect(aplicarCaixa(T, 'frase')).toBe('Manual do acampamento de inverno');
  });

  it('e recomeça depois de cada ponto final', () => {
    expect(aplicarCaixa('LEIA TUDO. ASSINE DEPOIS.', 'frase')).toBe('Leia tudo. Assine depois.');
  });

  it('minúsculas e MAIÚSCULAS', () => {
    expect(aplicarCaixa(T, 'minusculas')).toBe('manual do acampamento de inverno');
    expect(aplicarCaixa('manual do acampamento', 'maiusculas')).toBe('MANUAL DO ACAMPAMENTO');
  });

  it('cada palavra em maiúscula, inclusive as pequenas — como o Word faz', () => {
    expect(aplicarCaixa(T, 'palavras')).toBe('Manual Do Acampamento De Inverno');
  });

  it('alternar troca cada letra de lado', () => {
    expect(aplicarCaixa('Manual', 'alternar')).toBe('mANUAL');
  });

  /* Acento não é caso à parte, e é onde um toLowerCase() ingênuo tropeça. */
  it('acento sobrevive aos cinco modos', () => {
    expect(aplicarCaixa('ÁGUIA REAL', 'frase')).toBe('Águia real');
    expect(aplicarCaixa('águia real', 'palavras')).toBe('Águia Real');
  });
});
