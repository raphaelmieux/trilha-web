import { describe, it, expect } from 'vitest';
import {
  CIRCULAR_INICIAL, METAS_DA_CIRCULAR, PARAGRAFO_QUE_CHEGA, IDS_DO_ENDERECO,
  gestosVazios, metaDaVez, enderecoNumBlocoSo,
  type Doc, type ContextoDaCircular,
} from './circularDoClube';
import { paragrafosVazios, linhaDe, trechoDe, textoDoBloco, paragrafos } from './documento';

/*
  A circular do módulo 2, e as cinco metas que a consertam.

  O defeito aqui é **estrutural**, e por isso mais escondido do que o do módulo
  1: não há formatação direta, não há estilo errado, não há nada fora do lugar
  na tela. Há cinco parágrafos vazios e um endereço escrito com Enter — e os
  dois estão perfeitos no dia em que foram escritos.

  As três perguntas de sempre, mais uma que é só deste módulo: **dá para ver o
  que está errado?** Com as marcas de parágrafo desligadas, o Enter e a quebra
  de linha são invisíveis. Um laboratório sobre a diferença entre os dois em que
  ninguém pudesse ver a diferença cometeria, na própria tela, o defeito que a
  lição existe para nomear.
*/

const contexto = (doc: Doc, gestos = gestosVazios()): ContextoDaCircular => ({ doc, gestos });

/* ── A solução de referência ──────────────────────────────────────────────── */

/** Junta as três linhas do endereço num parágrafo só, com quebras de linha. */
const juntarEndereco = (d: Doc): Doc => {
  const doEndereco = d.blocos.filter(b => IDS_DO_ENDERECO.includes(b.id));
  const junto = {
    ...doEndereco[0],
    trechos: doEndereco.map((b, i) => ({
      ...trechoDe(`end-${i}`, textoDoBloco(b)),
      ...(i > 0 ? { quebra: true } : {}),
    })),
  };
  const antes = d.blocos.findIndex(b => b.id === IDS_DO_ENDERECO[0]);
  const restantes = d.blocos.filter(b => !IDS_DO_ENDERECO.includes(b.id));
  return { ...d, blocos: [...restantes.slice(0, antes), junto, ...restantes.slice(antes)] };
};

const acrescentarParagrafo = (d: Doc): Doc => {
  const depoisDe = d.blocos.findIndex(b => b.id === 'ab-3');
  const novo = linhaDe(PARAGRAFO_QUE_CHEGA.id, PARAGRAFO_QUE_CHEGA.secao, PARAGRAFO_QUE_CHEGA.texto);
  return { ...d, blocos: [...d.blocos.slice(0, depoisDe + 1), novo, ...d.blocos.slice(depoisDe + 1)] };
};

const trocarPorQuebra = (d: Doc): Doc => ({
  ...d,
  blocos: d.blocos
    .filter(b => textoDoBloco(b).trim() !== '')
    .map(b => (b.id === 'assina' ? { ...b, quebraDePagina: true } : b)),
});

const escolherFonte = (d: Doc): Doc => ({ ...d, fonte: 'serifada' });

function resolvido(): ContextoDaCircular {
  let d: Doc = CIRCULAR_INICIAL;
  d = juntarEndereco(d);
  d = acrescentarParagrafo(d);
  d = trocarPorQuebra(d);
  d = escolherFonte(d);
  return contexto(d, { marcas: true, cresceu: true });
}

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('a circular abre por consertar', () => {
  it('nenhuma das cinco metas está cumprida no primeiro segundo', () => {
    const verdes = METAS_DA_CIRCULAR
      .filter(m => m.feita(contexto(CIRCULAR_INICIAL)))
      .map(m => m.id);
    expect(verdes,
      'estas metas abrem verdes — lista com item já marcado ensina a não ler a lista')
      .toEqual([]);
  });

  it('os cinco Enters vazios estão lá, e o endereço está partido em três', () => {
    /*
      A guarda contra o vazio, na forma que este módulo pede: sem os defeitos
      plantados não há exercício nenhum, e as metas ficariam conferindo um
      documento que já nasceu certo.
    */
    expect(paragrafosVazios(CIRCULAR_INICIAL)).toHaveLength(5);
    expect(CIRCULAR_INICIAL.blocos.filter(b => b.secao === 'endereco')).toHaveLength(3);
    expect(enderecoNumBlocoSo(CIRCULAR_INICIAL)).toBe(false);
  });

  it('nenhum trecho chega com quebra de linha, e nenhum bloco com quebra de página', () => {
    // Se chegassem, a lição teria a resposta desenhada dentro dela.
    expect(paragrafos(CIRCULAR_INICIAL).some(b => b.trechos.some(x => x.quebra))).toBe(false);
    expect(CIRCULAR_INICIAL.blocos.some(b => b.quebraDePagina)).toBe(false);
  });

  it('a fonte não vem escolhida', () => {
    expect(CIRCULAR_INICIAL.fonte).toBeUndefined();
  });
});

describe('a circular pode ser vencida', () => {
  it('a solução de referência deixa a lista inteira verde', () => {
    const c = resolvido();
    const vermelhas = METAS_DA_CIRCULAR.filter(m => !m.feita(c)).map(m => m.id);
    expect(vermelhas,
      'laboratório impossível de vencer é pior do que um que abre resolvido')
      .toEqual([]);
  });

  it('cada meta é a primeira da vez em algum momento do caminho', () => {
    let c = contexto(CIRCULAR_INICIAL);
    const vistas: string[] = [];
    const passos: ((x: ContextoDaCircular) => ContextoDaCircular)[] = [
      x => ({ ...x, gestos: { ...x.gestos, marcas: true } }),
      x => ({ ...x, doc: juntarEndereco(x.doc) }),
      x => ({ doc: acrescentarParagrafo(x.doc), gestos: { ...x.gestos, cresceu: true } }),
      x => ({ ...x, doc: trocarPorQuebra(x.doc) }),
      x => ({ ...x, doc: escolherFonte(x.doc) }),
    ];
    for (const passo of passos) {
      vistas.push(metaDaVez(c)!.id);
      c = passo(c);
    }
    expect(vistas).toEqual(METAS_DA_CIRCULAR.map(m => m.id));
    expect(metaDaVez(c), 'sobrou meta depois do último passo').toBeNull();
  });
});

describe('juntar o endereço é quebra de linha, e não texto corrido', () => {
  it('colar as três linhas numa só não conta', () => {
    /*
      É a saída preguiçosa e ela destrói o endereço: "Sítio Recanto da Regional
      Rodovia DF-128, km 9 Sobradinho, DF" numa linha só não é um endereço, é
      uma frase. A meta exige as três linhas **e** as quebras entre elas.
    */
    const corrido: Doc = {
      ...CIRCULAR_INICIAL,
      blocos: [
        ...CIRCULAR_INICIAL.blocos.filter(b => b.secao !== 'endereco'),
        linhaDe('end', 'endereco', 'Sítio Recanto da Regional Rodovia DF-128, km 9 Sobradinho, DF'),
      ],
    };
    expect(enderecoNumBlocoSo(corrido)).toBe(false);
  });

  it('um parágrafo só, com as duas linhas de baixo entrando por quebra, conta', () => {
    expect(enderecoNumBlocoSo(juntarEndereco(CIRCULAR_INICIAL))).toBe(true);
  });

  it('as três linhas sem quebra nenhuma não contam', () => {
    // Três trechos colados num bloco, sem `quebra`, saem numa linha só na tela.
    const semQuebra = juntarEndereco(CIRCULAR_INICIAL);
    const sem: Doc = {
      ...semQuebra,
      blocos: semQuebra.blocos.map(b => (b.secao === 'endereco' && b.tipo === 'paragrafo'
        ? { ...b, trechos: b.trechos.map(({ quebra, ...x }) => { void quebra; return x; }) }
        : b)),
    };
    expect(enderecoNumBlocoSo(sem)).toBe(false);
  });
});

describe('a quebra de página é o que substitui os Enters', () => {
  it('apagar os vazios sem pôr a quebra não basta', () => {
    /*
      Apagar e pronto deixa a assinatura colada no texto, que é outro documento
      errado. A meta pede as duas metades: o que sai e o que entra no lugar.
    */
    const so: Doc = {
      ...CIRCULAR_INICIAL,
      blocos: CIRCULAR_INICIAL.blocos.filter(b => textoDoBloco(b).trim() !== ''),
    };
    const meta = METAS_DA_CIRCULAR.find(m => m.id === 'quebra')!;
    expect(meta.feita(contexto(so))).toBe(false);
  });

  it('pôr a quebra sem apagar os vazios também não basta', () => {
    const so: Doc = {
      ...CIRCULAR_INICIAL,
      blocos: CIRCULAR_INICIAL.blocos.map(b => (b.id === 'assina'
        ? { ...b, quebraDePagina: true } : b)),
    };
    const meta = METAS_DA_CIRCULAR.find(m => m.id === 'quebra')!;
    expect(meta.feita(contexto(so))).toBe(false);
  });
});

describe('cada meta diz onde e como', () => {
  it('nenhuma fica sem passo a passo nem sem lugar', () => {
    for (const m of METAS_DA_CIRCULAR) {
      expect(m.passos.length, `"${m.id}" não tem passo a passo`).toBeGreaterThanOrEqual(2);
      expect(m.onde.length, `"${m.id}" não diz onde isso se resolve`).toBeGreaterThan(4);
      expect(m.detalhe.length, `"${m.id}" não explica o que se pede`).toBeGreaterThan(40);
    }
  });
});
