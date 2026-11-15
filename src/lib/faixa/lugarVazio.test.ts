import { describe, it, expect } from 'vitest';
import { explicarLugarVazio } from './lugarVazio';
import { gruposDaFaixa } from './catalogoDaFaixa';
import { empacotarFaixa } from './empacotarFaixa';
import { EDICAO_ANTIGA } from '../escadasDeInsignia';

/*
  O lugar vazio diz o que falta, e o segredo vazio não diz o que é.

  As duas metades erram calado do lado oposto: um cartão vazio ("ainda não
  conquistada", e mais nada) deixa a pessoa sem saber o que fazer, e o mesmo
  cartão escrevendo o nome do segredo entrega a resposta a quem só clicou.
*/

const faixa = empacotarFaixa(gruposDaFaixa({ comEdicaoAntiga: true }));
const peca = (id: string) => {
  const p = faixa.pecas.find(x => x.id === id);
  if (!p) throw new Error(`a Faixa não tem a peça ${id}`);
  return p;
};
const nada = new Set<string>();

describe('o lugar vazio', () => {
  it('toda peça da Faixa tem o que dizer', () => {
    expect(faixa.pecas.length, 'a Faixa veio vazia').toBeGreaterThan(500);
    for (const p of faixa.pecas) {
      const l = explicarLugarVazio(p, nada);
      expect(l.titulo, p.id).toBeTruthy();
      expect(l.como.length, `${p.id} sem "como se conquista"`).toBeGreaterThan(10);
    }
  });

  /* O nome do segredo é a resposta. Nem o título, nem a linha de baixo, nem
     o "como" podem trazê-lo — e a família também não, que já diz metade. */
  it('o segredo diz só a dica, nunca o nome', () => {
    const segredos = faixa.pecas.filter(p => p.dica);
    expect(segredos.length, 'a trava não achou segredo nenhum').toBeGreaterThan(5);
    for (const p of segredos) {
      const l = explicarLugarVazio(p, nada);
      const tudo = JSON.stringify(l);
      expect(l.titulo).toBe('Segredo');
      expect(l.dica).toBe(p.dica);
      expect(tudo, `o lugar de ${p.id} entrega o nome`).not.toContain(p.nome);
      expect(l.caminho, `o lugar de ${p.id} aponta um caminho`).toBeUndefined();
      expect(l.passos, `o lugar de ${p.id} lista o que o fecha`).toBeUndefined();
    }
  });

  it('a trilha aberta leva a ela', () => {
    const l = explicarLugarVazio(peca('ap034_complete'), nada);
    expect(l.subtitulo).toContain('Trilha');
    expect(l.caminho?.para).toBe('/especialidade/AP034');
  });

  it('a anunciada não leva a lugar nenhum, e diz que está sendo escrita', () => {
    const anunciada = faixa.pecas.find(p => p.material === 'patch' && p.emBreve)!;
    const l = explicarLugarVazio(anunciada, nada);
    expect(l.emBreve).toBe(true);
    expect(l.caminho).toBeUndefined();
  });

  it('a vereda aberta leva a ela', () => {
    const l = explicarLugarVazio(peca('vereda_html'), nada);
    expect(l.subtitulo).toContain('Vereda');
    expect(l.caminho?.para).toBe('/vereda/CC-FE001');
  });

  /* O Mestrado é o único lugar em que "como eu ponho isto aqui?" é uma
     lista, e ela tem de dizer o que já foi feito. */
  it('o Mestrado lista a família e conta o que já foi feito', () => {
    const l = explicarLugarVazio(peca('mestrado_computacao'), new Set(['ap041_complete', 'ap043_complete']));
    expect(l.passos?.map(x => x.nome.slice(0, 5))).toEqual(['AP041', 'AP042', 'AP043', 'AP044', 'AP045']);
    expect(l.passos?.filter(x => x.feito).length).toBe(2);
    expect(l.como).toContain('Você tem 2');
  });

  it('o laboratório leva à trilha dele', () => {
    const lab = faixa.pecas.find(p => p.unidade === 'AP034' && p.material === 'pin' && p.insignia)!;
    const l = explicarLugarVazio(lab, nada);
    expect(l.subtitulo).toContain('Laboratório');
    expect(l.caminho?.para).toBe('/especialidade/AP034');
  });

  it('o laboratório previsto diz que a lição ainda está sendo escrita', () => {
    const previsto = faixa.pecas.find(p => p.id.startsWith('previsto:'))!;
    const l = explicarLugarVazio(previsto, nada);
    expect(l.emBreve).toBe(true);
    expect(l.caminho).toBeUndefined();
  });

  it('o degrau diz a escada e a posição nela', () => {
    const l = explicarLugarVazio(peca('licoes_5'), nada);
    expect(l.subtitulo).toMatch(/Lições, degrau \d de 7/);
  });

  /* A edição antiga não se ganha mais: pedir o feito dela seria prometer o
     que nenhuma regra concede. */
  it('a edição antiga diz que não se ganha mais', () => {
    const l = explicarLugarVazio(peca(EDICAO_ANTIGA[0].code), nada);
    expect(l.como).toContain('Não se ganha mais');
  });
});
