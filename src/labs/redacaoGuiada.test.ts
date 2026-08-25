import { describe, it, expect } from 'vitest';
import {
  ROTEIROS, contarPalavras, totalDePalavras, etapaPronta, etapasPendentes,
  respostasParaUniao, podeUnir, unirLocalmente,
  type RoteiroRedacao, type RespostasRedacao,
} from './redacaoGuiada';
import { ROTEIROS as ROTEIROS_SERVIDOR } from '../../supabase/functions/ai-gateway/redacao';
import { getOpenSpecialties } from '../curriculum';

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

/*
  As travas de todo roteiro, e não as de um.

  Elas nasceram olhando só para `ROTEIROS.AP041`, porque só existia esse. Uma
  trilha nova entraria fora de todas elas, e os defeitos que estas travas pegam
  não aparecem na tela: o beco sem saída dos mínimos só se manifesta em quem
  cumpriu as oito etapas, e etapa que o servidor não conhece só falha na hora
  de conferir a resposta.
*/
describe.each(Object.entries(ROTEIROS))('o roteiro da %s', (codigo, roteiro) => {
  it('pede um total de palavras', () => {
    expect(roteiro.minPalavrasTotal).toBeGreaterThan(0);
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
    expect(soma, `${codigo}: mínimos somam ${soma}`).toBeGreaterThanOrEqual(roteiro.minPalavrasTotal);
  });

  /* A opinião fecha o texto. No meio, ela interrompe a narrativa de fatos —
     e é a única etapa que o validador não confere contra nada. */
  it('tem no máximo uma etapa de opinião, e é a última', () => {
    const opiniao = roteiro.etapas.filter(e => e.opiniao);
    expect(opiniao.length).toBeLessThanOrEqual(1);
    if (opiniao.length === 1) {
      expect(roteiro.etapas[roteiro.etapas.length - 1].opiniao).toBe(true);
    }
  });

  it('toda etapa diz o que pesquisar e mostra um exemplo', () => {
    for (const e of roteiro.etapas) {
      expect(e.pergunta.length, `${codigo}/${e.id}`).toBeGreaterThan(20);
      expect(e.paraPesquisar.length, `${codigo}/${e.id}`).toBeGreaterThan(20);
      expect(e.exemplo.length, `${codigo}/${e.id}`).toBeGreaterThan(10);
    }
  });
});

/*
  As duas pontas da redação guiada precisam falar das mesmas etapas.

  A tela conhece as perguntas; o servidor conhece os fatos contra os quais a
  resposta é conferida. O servidor recusa validar id que não conheça — de
  propósito, para o navegador não poder mandar fatos inventados junto. O preço
  é que uma etapa que exista só de um lado vira uma etapa que nunca aprova, e a
  tela não tem como explicar isso a quem está escrevendo.
*/
describe('cliente e servidor conhecem as mesmas etapas', () => {
  for (const [codigo, roteiro] of Object.entries(ROTEIROS)) {
    it(`${codigo}`, () => {
      const noServidor = ROTEIROS_SERVIDOR[codigo];
      expect(noServidor, `${codigo} não tem fatos no servidor`).toBeDefined();

      const naTela = roteiro.etapas.map(e => e.id).sort();
      const noBanco = Object.keys(noServidor.etapas).sort();
      expect(noBanco).toEqual(naTela);

      /* Etapa de fato precisa de fato; etapa de opinião não confere nada. */
      for (const e of roteiro.etapas) {
        const s = noServidor.etapas[e.id];
        expect(!!s.opiniao, `${codigo}/${e.id}: opinião difere entre as pontas`).toBe(!!e.opiniao);
        if (!e.opiniao) expect(s.fatos.length, `${codigo}/${e.id}: sem fatos`).toBeGreaterThan(0);
      }
    });
  }
});

/*
  Trilha com laboratório de redação guiada precisa de roteiro.

  Sem ele o laboratório abre vazio: nem perguntas, nem etapas, nem como
  concluir — e o requisito oficial da trilha fica impossível de cumprir sem que
  nada na tela diga o porquê.
*/
describe('todo laboratório de redação guiada tem roteiro', () => {
  it('nenhuma trilha aberta fica sem', () => {
    const semRoteiro: string[] = [];
    for (const e of getOpenSpecialties()) {
      const temLab = e.modules.some(m => m.lessons.some(l => l.labType === 'redacao_guiada'));
      if (temLab && !ROTEIROS[e.code]) semRoteiro.push(e.code);
    }
    expect(semRoteiro, semRoteiro.join(', ')).toEqual([]);
  });
});
