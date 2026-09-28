import { describe, it, expect } from 'vitest';
import {
  CADERNO_VAZIO, METAS_DA_PESQUISA, PAGINAS, PERGUNTAS, PERGUNTAS_DO_RECORTE,
  buscar, copiaDaFonte, fichasParaEntregar, problemaDaFicha,
  type Caderno, type Ficha,
} from './pesquisaDoBug';
import { ROTEIROS as ROTEIROS_SERVIDOR } from '../../supabase/functions/ai-gateway/redacao';

/*
  A pesquisa do requisito 6 da AP045.

  Nenhuma meta abre verde, a solução de referência fecha todas, e cada atalho
  que um desbravador apressado tentaria deixa vermelha a meta que ele engana.
*/

const ficha = (id: string, paragrafoId: string, pergunta: Ficha['pergunta'], anotacao: string, desmente = false): Ficha =>
  ({ id, paragrafoId, pergunta, anotacao, desmente });

function resolvido(): Caderno {
  return {
    recorte: [...PERGUNTAS_DO_RECORTE],
    buscas: ['bug do milênio'],
    abertas: PAGINAS.map(p => p.id),
    avaliacoes: Object.fromEntries(PAGINAS.map(p => [p.id, p.confiavel ? 'confiavel' : 'nao-confiavel'])),
    fichas: [
      ficha('f1', 'acervo-1', 'causa', 'Para gastar menos memória, que custava caro, os programas escreviam só o fim do ano.'),
      ficha('f2', 'reportagem-1', 'temor', 'As pessoas tinham medo e guardaram água, comida e dinheiro em casa antes da virada.'),
      ficha('f3', 'enciclo-2', 'correcao', 'Os programas foram revisados por anos e passaram a gravar o ano inteiro, com quatro números.'),
      ficha('f4', 'acervo-4', 'resultado', 'Nada de grave aconteceu: nenhum avião caiu, só houve erros pequenos de data consertados logo.', true),
    ],
  };
}

const meta = (id: string) => METAS_DA_PESQUISA.find(m => m.id === id)!;
const feitas = (c: Caderno) => METAS_DA_PESQUISA.filter(m => m.feita(c)).map(m => m.id);

describe('o caderno vazio', () => {
  it('nenhuma meta abre verde', () => {
    expect(feitas(CADERNO_VAZIO)).toEqual([]);
  });
});

describe('a solução de referência', () => {
  it('fecha todas as metas', () => {
    expect(feitas(resolvido())).toEqual(METAS_DA_PESQUISA.map(m => m.id));
  });

  it('toda ficha dela vale', () => {
    for (const f of resolvido().fichas) expect(problemaDaFicha(f), f.id).toBeNull();
  });
});

describe('o recorte', () => {
  it('marcar as sete não é recortar', () => {
    expect(meta('recorte').feita({ ...resolvido(), recorte: PERGUNTAS.map(p => p.id) })).toBe(false);
  });

  it('as certas não vêm todas em cima da lista', () => {
    const primeiras = PERGUNTAS.slice(0, PERGUNTAS_DO_RECORTE.length).every(p => p.doRecorte);
    expect(primeiras).toBe(false);
  });

  it('toda pergunta de fora diz por quê', () => {
    for (const p of PERGUNTAS.filter(x => !x.doRecorte)) expect(p.porque, p.id).toBeTruthy();
  });
});

describe('a avaliação das fontes', () => {
  it('avaliar tudo como confiável não passa', () => {
    const tudo = Object.fromEntries(PAGINAS.map(p => [p.id, 'confiavel' as const]));
    expect(meta('fontes').feita({ ...resolvido(), avaliacoes: tudo })).toBe(false);
  });

  it('deixar uma página sem avaliar não passa', () => {
    const { blog: _blog, ...sem } = resolvido().avaliacoes;
    void _blog;
    expect(meta('fontes').feita({ ...resolvido(), avaliacoes: sem })).toBe(false);
  });

  /* As três espécies existem: sem a incompleta, abrir uma página só bastaria;
     sem a não confiável, avaliar seria marcar tudo como confiável. */
  it('há página confiável completa, confiável incompleta e não confiável', () => {
    const cobre = (p: typeof PAGINAS[number]) => new Set(p.paragrafos.map(x => x.responde).filter(Boolean)).size;
    expect(PAGINAS.some(p => p.confiavel && cobre(p) >= 3)).toBe(true);
    expect(PAGINAS.some(p => p.confiavel && cobre(p) === 1)).toBe(true);
    expect(PAGINAS.filter(p => !p.confiavel).length).toBeGreaterThanOrEqual(3);
  });

  it('nenhuma página responde às quatro perguntas sozinha', () => {
    for (const p of PAGINAS) {
      const cobre = new Set(p.paragrafos.map(x => x.responde).filter(Boolean));
      expect(cobre.size, p.id).toBeLessThan(PERGUNTAS_DO_RECORTE.length);
    }
  });

  it('as não confiáveis não têm fonte citada, e as confiáveis têm', () => {
    for (const p of PAGINAS) expect(p.fontes.length > 0, p.id).toBe(p.confiavel);
  });
});

describe('a busca', () => {
  it('traz as oito para "bug do milênio", sem depender do acento', () => {
    expect(buscar('bug do milênio')).toHaveLength(PAGINAS.length);
    expect(buscar('BUG DO MILENIO').map(p => p.id)).toEqual(buscar('bug do milênio').map(p => p.id));
  });

  /* O primeiro resultado não é o especializado: é o hábito que a lição
     existe para desfazer. */
  it('o primeiro resultado da busca óbvia não é confiável', () => {
    expect(buscar('bug do milênio')[0].confiavel).toBe(false);
  });

  it('busca fora do assunto não devolve nada', () => {
    expect(buscar('futebol')).toEqual([]);
    expect(buscar('')).toEqual([]);
  });
});

describe('as fichas', () => {
  it('ficha de página não confiável deixa "fichas" vermelha, mesmo com as quatro cobertas', () => {
    const c = resolvido();
    const comRuim = { ...c, fichas: [...c.fichas, ficha('f9', 'blog-1', 'resultado', 'Um blog diz que aviões caíram na virada e que a mídia escondeu tudo.')] };
    expect(meta('fichas').feita(comRuim)).toBe(false);
    expect(problemaDaFicha(comRuim.fichas[4])).toMatch(/não é uma fonte/);
  });

  it('anotação copiada da página não vale', () => {
    const copiada = ficha('fx', 'acervo-3', 'temor',
      'Temia-se que sistemas de bancos, de energia elétrica, de telefonia e de hospitais falhassem.');
    expect(problemaDaFicha(copiada)).toMatch(/suas palavras/);
    const c = resolvido();
    expect(meta('fichas').feita({ ...c, fichas: [c.fichas[0], copiada, c.fichas[2], c.fichas[3]] })).toBe(false);
  });

  it('ficha com a pergunta trocada não cobre a pergunta', () => {
    const c = resolvido();
    const trocada = { ...c.fichas[1], pergunta: 'correcao' as const };
    expect(meta('fichas').feita({ ...c, fichas: [c.fichas[0], trocada, c.fichas[2], c.fichas[3]] })).toBe(false);
  });

  it('marcar "desmente" num trecho que não desmente não desmente nada', () => {
    const c = resolvido();
    const fichas = c.fichas.map(f => ({ ...f, desmente: f.id === 'f3' }));
    expect(meta('mito').feita({ ...c, fichas })).toBe(false);
  });

  it('a conta de cópia não acusa paráfrase com poucas palavras em comum', () => {
    expect(copiaDaFonte('o ano 2000 foi gravado como 00 em vários programas antigos',
      'O problema aparece na virada: o ano 2000 seria gravado como 00.')).toBe(false);
  });

  it('a conta de cópia ignora acento e maiúscula', () => {
    expect(copiaDaFonte('NA VIRADA, OS DESASTRES PREVISTOS NAO ACONTECERAM, NENHUM AVIAO CAIU',
      'Na virada, os desastres previstos não aconteceram. Nenhum avião caiu por causa do bug')).toBe(true);
  });
});

describe('o que vai para o relatório', () => {
  it('leva só as fichas que valem, com a referência pronta', () => {
    const c = resolvido();
    const entregues = fichasParaEntregar({ ...c, fichas: [...c.fichas, ficha('f9', 'blog-1', 'resultado', 'aviões caíram')] });
    expect(entregues.map(f => f.id)).toEqual(['f1', 'f2', 'f3', 'f4']);
    expect(entregues[0].fonte).toMatch(/Acervo Histórico da Computação/);
    expect(entregues[0].fonte).toMatch(/Disponível em/);
  });

  /*
    O relatório é conferido pelo servidor contra fatos. Uma pergunta do recorte
    sem etapa no roteiro do servidor seria uma ficha que o relatório não tem
    onde usar.
  */
  it('toda pergunta do recorte é uma etapa do relatório no servidor', () => {
    const etapas = Object.keys(ROTEIROS_SERVIDOR['AP045-bug-do-milenio'].etapas);
    for (const q of PERGUNTAS_DO_RECORTE) expect(etapas).toContain(q);
  });
});
