import { describe, it, expect } from 'vitest';
import {
  PESQUISA_DO_RELATORIO, faltaNaEtapa, lerFichas, referencias, semReferencias,
} from './relatorioDePesquisa';
import { ROTEIROS } from './redacaoGuiada';
import { getOpenSpecialties } from '../curriculum';
import type { FichaEntregue } from './pesquisaDoBug';

const ficha: FichaEntregue = {
  id: 'f1', pergunta: 'resultado', desmente: true, site: 'Acervo Histórico da Computação',
  anotacao: 'Nada de grave aconteceu na virada.',
  trecho: 'Na virada, os desastres previstos não aconteceram. Nenhum avião caiu por causa do bug e não houve apagão em larga escala.',
  fonte: 'Profa. Helena Martins. O bug do milênio. Acervo Histórico da Computação.',
};
const roteiro = ROTEIROS['AP045-bug-do-milenio'];
const etapa = roteiro.etapas.find(e => e.id === 'resultado')!;
const opiniao = roteiro.etapas.find(e => e.opiniao)!;

describe('o relatório a partir das fichas', () => {
  it('etapa de fato sem ficha citada não vale', () => {
    expect(faltaNaEtapa(etapa, { texto: 'qualquer coisa' }, [ficha])?.tipo).toBe('citar');
  });

  it('cópia sem aspas trava; a mesma cópia entre aspas é citação', () => {
    const copia = 'Na virada, os desastres previstos não aconteceram. Nenhum avião caiu por causa do bug.';
    expect(faltaNaEtapa(etapa, { texto: copia, fichas: ['f1'] }, [ficha])?.tipo).toBe('copia');
    expect(faltaNaEtapa(etapa, { texto: `A fonte diz: "${copia}"`, fichas: ['f1'] }, [ficha])).toBeNull();
  });

  it('copiar de ficha não marcada também é cópia', () => {
    const outra = { ...ficha, id: 'f2', trecho: 'x' };
    const copia = 'Na virada, os desastres previstos não aconteceram. Nenhum avião caiu por causa do bug.';
    expect(faltaNaEtapa(etapa, { texto: copia, fichas: ['f2'] }, [ficha, outra])?.tipo).toBe('copia');
  });

  it('a opinião não cita ficha', () => {
    expect(faltaNaEtapa(opiniao, { texto: 'eu acho' }, [ficha])).toBeNull();
  });

  it('as referências não contam palavras', () => {
    const texto = `um dois três\n\n${referencias([ficha, ficha])}`;
    expect(semReferencias(texto)).toBe('um dois três\n');
    expect(referencias([ficha, ficha]).split('\n')).toHaveLength(2);
  });

  it('o mínimo é 200 e as etapas o alcançam', () => {
    expect(roteiro.minPalavrasTotal).toBe(200);
    expect(roteiro.etapas.reduce((s, e) => s + e.minPalavras, 0)).toBeGreaterThanOrEqual(200);
  });

  it('lê do banco só fichas com forma de ficha', () => {
    expect(lerFichas({ fichas: [ficha, { id: 'x' }, 'lixo'] })).toEqual([ficha]);
    expect(lerFichas(null)).toEqual([]);
  });

  /* Lição de relatório sem pesquisa ligada abriria dizendo que não há
     pesquisa, para sempre. */
  it('toda lição de relatório de pesquisa tem pesquisa e roteiro', () => {
    const licoes = getOpenSpecialties().flatMap(t => t.modules.flatMap(m => m.lessons))
      .filter(l => l.labType === 'relatorio_de_pesquisa');
    expect(licoes.length).toBeGreaterThan(0);
    for (const l of licoes) {
      const ligacao = PESQUISA_DO_RELATORIO[l.code];
      expect(ligacao, l.code).toBeDefined();
      expect(ROTEIROS[ligacao.projeto], l.code).toBeDefined();
    }
  });
});
