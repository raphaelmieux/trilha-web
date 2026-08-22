import { describe, it, expect } from 'vitest';
import {
  ROTEIROS, contarPalavras, totalDePalavras, etapaPronta, etapasPendentes,
  respostasParaUniao, podeUnir, unirLocalmente,
  type RoteiroRedacao, type RespostasRedacao,
} from './redacaoGuiada';

/**
 * Uma resposta conferida e em ordem, do tamanho pedido.
 *
 * A `marca` deixa cada resposta distinguível das outras: com um texto só, um
 * teste que verifica a ausência de uma etapa no resultado passa (ou falha) por
 * causa do texto de outra.
 */
let marcaSeguinte = 0;
function ok(palavras: number, veredito: 'ok' | 'impreciso' | 'fora_do_tema' = 'ok') {
  const marca = `m${marcaSeguinte++}`;
  const texto = Array.from({ length: palavras }, (_, i) => `${marca}w${i}`).join(' ');
  return { texto, conferencia: { veredito, observacao: '' }, conferidoEm: texto };
}

const roteiroFalso: RoteiroRedacao = {
  titulo: 'Teste',
  introducao: '',
  minPalavrasTotal: 40,
  etapas: [
    { id: 'a', titulo: 'A', pergunta: '', paraPesquisar: '', exemplo: '', minPalavras: 10 },
    { id: 'b', titulo: 'B', pergunta: '', paraPesquisar: '', exemplo: '', minPalavras: 10 },
  ],
};

const tudoOk: RespostasRedacao = { a: ok(25), b: ok(25) };

describe('contagem de palavras', () => {
  it('conta palavras separadas por qualquer espaço', () => {
    expect(contarPalavras('uma  duas\ttrês\nquatro')).toBe(4);
  });

  it('trata vazio e só espaços como zero', () => {
    expect(contarPalavras('')).toBe(0);
    expect(contarPalavras('   \n  ')).toBe(0);
  });

  it('soma o total de todas as etapas', () => {
    expect(totalDePalavras(tudoOk)).toBe(50);
  });
});

describe('quando uma etapa conta como pronta', () => {
  const etapa = roteiroFalso.etapas[0];

  it('não está pronta sem resposta', () => {
    expect(etapaPronta(etapa, undefined)).toBe(false);
  });

  it('não está pronta abaixo do mínimo de palavras', () => {
    expect(etapaPronta(etapa, ok(9))).toBe(false);
  });

  it('não está pronta antes de ser conferida', () => {
    expect(etapaPronta(etapa, { texto: ok(20).texto })).toBe(false);
  });

  it('está pronta quando tem tamanho e conferência', () => {
    expect(etapaPronta(etapa, ok(20))).toBe(true);
  });

  it('aceita imprecisa, para quem prefere seguir sem corrigir', () => {
    expect(etapaPronta(etapa, ok(20, 'impreciso'))).toBe(true);
  });

  it('recusa a que ficou fora do tema', () => {
    expect(etapaPronta(etapa, ok(20, 'fora_do_tema'))).toBe(false);
  });

  /*
    O caso que motivou guardar `conferidoEm`: aprovar a resposta, reescrevê-la
    com uma data errada e enviar. A conferência é do texto que foi conferido, e
    não da etapa.
  */
  it('deixa de valer quando o texto muda depois da conferência', () => {
    const adulterada = { ...ok(20), texto: 'texto trocado depois de aprovado, com vinte palavras para passar do mínimo exigido pela etapa aqui ok' };
    expect(etapaPronta(etapa, adulterada)).toBe(false);
  });

  it('lista as pendentes na ordem do roteiro', () => {
    expect(etapasPendentes(roteiroFalso, { a: ok(20) }).map(e => e.id)).toEqual(['b']);
  });
});

describe('o que entra no texto final', () => {
  it('leva só o que foi conferido e está em ordem', () => {
    const r = respostasParaUniao(roteiroFalso, { a: ok(20), b: ok(20, 'impreciso') });
    expect(r.map(x => x.etapaId)).toEqual(['a']);
  });

  it('mantém a ordem do roteiro, não a de digitação', () => {
    const r = respostasParaUniao(roteiroFalso, { b: ok(20), a: ok(20) });
    expect(r.map(x => x.etapaId)).toEqual(['a', 'b']);
  });

  it('não deixa unir com etapa faltando', () => {
    expect(podeUnir(roteiroFalso, { a: ok(25) })).toBe(false);
  });

  it('não deixa unir abaixo do total de palavras exigido', () => {
    expect(podeUnir(roteiroFalso, { a: ok(10), b: ok(10) })).toBe(false);
  });

  it('deixa unir com tudo pronto e o total atingido', () => {
    expect(podeUnir(roteiroFalso, tudoOk)).toBe(true);
  });

  /* Uma imprecisão não corrigida trava a montagem: o relatório é o que vai
     valer como cumprimento do requisito. */
  it('não deixa unir enquanto houver imprecisão não corrigida', () => {
    expect(podeUnir(roteiroFalso, { a: ok(25), b: ok(25, 'impreciso') })).toBe(false);
  });
});

describe('união local, para quando a IA não responde', () => {
  it('junta o texto das respostas em ordem', () => {
    const texto = unirLocalmente(roteiroFalso, tudoOk);
    expect(texto).toContain(tudoOk.a.texto);
    expect(texto).toContain(tudoOk.b.texto);
  });

  it('não inventa nada: só o que o desbravador escreveu', () => {
    const texto = unirLocalmente(roteiroFalso, tudoOk);
    const escritas = new Set([...tudoOk.a.texto.split(' '), ...tudoOk.b.texto.split(' ')]);
    for (const palavra of texto.split(/\s+/)) expect(escritas.has(palavra)).toBe(true);
  });

  it('deixa de fora o que não passou na conferência', () => {
    const texto = unirLocalmente(roteiroFalso, { a: ok(25), b: ok(25, 'fora_do_tema') });
    expect(texto).not.toContain(tudoOk.b.texto);
  });
});

describe('o roteiro da AP041', () => {
  const roteiro = ROTEIROS.AP041;

  it('existe e pede as 250 palavras do documento oficial', () => {
    expect(roteiro).toBeDefined();
    expect(roteiro.minPalavrasTotal).toBe(250);
  });

  it('dá a cada etapa um id único', () => {
    const ids = roteiro.etapas.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /*
    A trava que pegou um beco sem saída de verdade: os mínimos somavam 190 para
    um total exigido de 250. Quem cumprisse as oito etapas veria "8 de 8
    prontas" e o botão de montar continuaria desligado, sem nada na tela
    explicando que faltavam sessenta palavras.
  */
  it('soma dos mínimos das etapas alcança o total exigido', () => {
    const soma = roteiro.etapas.reduce((s, e) => s + e.minPalavras, 0);
    expect(soma).toBeGreaterThanOrEqual(roteiro.minPalavrasTotal);
  });

  it('só a última etapa é de opinião', () => {
    const opiniao = roteiro.etapas.filter(e => e.opiniao).map(e => e.id);
    expect(opiniao).toEqual(['mudou']);
  });

  it('toda etapa diz o que pesquisar e mostra um exemplo', () => {
    for (const e of roteiro.etapas) {
      expect(e.pergunta.length, e.id).toBeGreaterThan(20);
      expect(e.paraPesquisar.length, e.id).toBeGreaterThan(20);
      expect(e.exemplo.length, e.id).toBeGreaterThan(10);
    }
  });
});
