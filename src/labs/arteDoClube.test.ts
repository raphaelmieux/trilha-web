import { describe, expect, it } from 'vitest';
import {
  alinhamentoFunciona, comoDeuteranope, contrasteFunciona, coresDistintas, foraDaGama,
  hierarquiaFunciona, hslDe, margemMinima, margemPedida, mesmaForma, mesmoEstilo,
  proximidadeFunciona, textos, textosSobrepostos, textosSoltos, umaPrancha,
} from './design';
import {
  ARTE_INICIAL, AVISO, BATISMO, CAMPORI, CARTAZ, CARTOES, CLASSE_DA_PECA,
  COR_DA_SITUACAO, ESCALA, FOLHETO, GINCANA, GRUPOS_DO_AVISO, HORAS_DOS_CARTOES,
  PALETA_INICIAL, PECAS_DA_ANALISE, PROGRAMACAO, TITULOS_DOS_CARTOES, tituloDaPeca,
} from './arteDoClube';
import { contrastRatio, hexToRgb } from '../lib/imageTools';

/*
  As premissas do arquivo do clube.

  Cada peça chega com o defeito que a lição dela conserta, e **só** com ele.
  Consertar um por engano apagaria a lição daquele módulo sem reprovar nada —
  a meta continuaria vermelha no começo por outro motivo, e a trava de "nenhuma
  meta abre verde" seguiria contente.
*/

const p = (id: string) => umaPrancha(ARTE_INICIAL, id)!;

describe('o cartaz do módulo 1', () => {
  it('falha só na hierarquia', () => {
    expect(hierarquiaFunciona(p(CARTAZ), 'titulo')).toBe(false);
    expect(contrasteFunciona(p(CARTAZ))).toBe(true);
    expect(alinhamentoFunciona(p(CARTAZ))).toBe(true);
    expect(textosSobrepostos(p(CARTAZ))).toEqual([]);
  });

  it('chega com um tamanho só', () => {
    expect(new Set(textos(p(CARTAZ)).map(t => t.corpo)).size).toBe(1);
  });
});

describe('o aviso do módulo 2', () => {
  it('chega com as linhas fora da borda e o mesmo vão entre todas', () => {
    expect(textosSoltos(p(AVISO)).length).toBeGreaterThanOrEqual(5);
    expect(proximidadeFunciona(p(AVISO), GRUPOS_DO_AVISO)).toBe(false);
    const ys = textos(p(AVISO)).map(t => t.y).sort((a, b) => a - b).slice(1);
    const vaos = ys.slice(1).map((y, i) => y - ys[i]);
    expect(new Set(vaos).size).toBe(1);
  });

  it('os grupos declarados cobrem todas as linhas, uma vez cada', () => {
    const ids = GRUPOS_DO_AVISO.flat();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(textos(p(AVISO)).map(t => t.id).sort());
  });
});

describe('a programação do módulo 3', () => {
  it('chega sem repetição e sem respiro', () => {
    expect(mesmaForma(p(PROGRAMACAO), CARTOES)).toBe(false);
    expect(mesmoEstilo(p(PROGRAMACAO), TITULOS_DOS_CARTOES)).toBe(false);
    expect(mesmoEstilo(p(PROGRAMACAO), HORAS_DOS_CARTOES)).toBe(false);
    expect(margemMinima(p(PROGRAMACAO))).toBeLessThan(margemPedida(p(PROGRAMACAO)));
  });
});

describe('a paleta do módulo 4', () => {
  it('cada cor chega com o defeito de uma meta', () => {
    expect(contrastRatio(PALETA_INICIAL.texto!, PALETA_INICIAL.fundo!)).toBeLessThan(4.5);
    expect(foraDaGama(PALETA_INICIAL.destaque!)).toBe(true);
    expect(hslDe(PALETA_INICIAL.neutro!).s).toBeGreaterThan(0.15);
    /* O apoio não é do matiz do destaque: é outra cor, que não conversa com ele. */
    const [d, a] = [hslDe(PALETA_INICIAL.destaque!), hslDe(PALETA_INICIAL.apoio!)];
    expect(Math.abs(d.h - a.h)).toBeGreaterThan(15);
  });
});

describe('o folheto do módulo 5', () => {
  it('chega com duas sem serifa e o texto apertado', () => {
    const fs = new Set(textos(p(FOLHETO)).map(t => t.familia));
    expect([...fs].sort()).toEqual(['Arial', 'Verdana']);
    const par = textos(p(FOLHETO)).find(t => t.id === 'paragrafo-1')!;
    expect(par.corpo).toBeLessThan(14);
    expect(par.entrelinha).toBe(1);
  });
});

describe('as três peças da análise', () => {
  /*
    O veredito que a lição espera é o que as medidas dão, e é por isso que ele
    não está escrito em lugar nenhum além da classe. Esta trava confere que a
    peça "bem resolvida" passa nos três e que a discutível falha em um só — se
    alguém mexer numa cor e ela passar a falhar em dois, a lição passaria a
    chamar de discutível uma peça mal resolvida.
  */
  const medida = (id: string) => {
    const peca = p(id);
    return [
      hierarquiaFunciona(peca, tituloDaPeca(peca)),
      contrasteFunciona(peca),
      alinhamentoFunciona(peca),
    ].filter(ok => !ok).length;
  };

  it('a bem resolvida não falha em nada', () => {
    expect(CLASSE_DA_PECA[GINCANA]).toBe('bem');
    expect(medida(GINCANA)).toBe(0);
  });

  it('a mal resolvida falha nos três', () => {
    expect(CLASSE_DA_PECA[BATISMO]).toBe('mal');
    expect(medida(BATISMO)).toBe(3);
  });

  it('a discutível falha num só, e é o contraste do título sobre a foto', () => {
    expect(CLASSE_DA_PECA[CAMPORI]).toBe('discutivel');
    expect(medida(CAMPORI)).toBe(1);
    expect(contrasteFunciona(p(CAMPORI))).toBe(false);
  });

  it('no convite do batismo nenhuma linha está apoiada em nada', () => {
    expect(textosSoltos(p(BATISMO)).map(t => t.id).sort())
      .toEqual(textos(p(BATISMO)).map(t => t.id).sort());
  });

  it('a tela não mostra as peças na ordem da classe', () => {
    const ordem = PECAS_DA_ANALISE.map(id => CLASSE_DA_PECA[id]);
    expect(ordem).not.toEqual(['bem', 'mal', 'discutivel']);
    expect(ordem).not.toEqual(['bem', 'discutivel', 'mal']);
  });
});

describe('a escala do módulo 8', () => {
  it('confirmado e cancelado se distinguem a olho nu e viram a mesma cor na deuteranopia', () => {
    const [v, r] = [COR_DA_SITUACAO.confirmado, COR_DA_SITUACAO.cancelado];
    expect(coresDistintas(v, r)).toBe(true);
    const [sv, sr] = [hexToRgb(comoDeuteranope(v))!, hexToRgb(comoDeuteranope(r))!];
    expect(Math.max(Math.abs(sv.r - sr.r), Math.abs(sv.g - sr.g), Math.abs(sv.b - sr.b))).toBeLessThan(20);
  });

  it('a situação só existe na cor: nenhuma linha diz a palavra', () => {
    const escrito = textos(p(ESCALA)).filter(t => t.id.startsWith('nome-')).map(t => t.texto.toLowerCase()).join(' ');
    for (const palavra of ['confirmado', 'pendente', 'cancelado']) expect(escrito).not.toContain(palavra);
  });
});
