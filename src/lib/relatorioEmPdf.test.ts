import { describe, it, expect } from 'vitest';
import { emOrdemDeConquista } from './conquista';
import { paginasDoSumario, GEOMETRIA_DO_SUMARIO } from './pdf';
import type { InsigniaConquistada } from './conquista';

/*
  As duas contas do relatório em PDF que erram calado.

  O desenho em si se confere abrindo o arquivo — foi assim que a capa, o
  sumário e a numeração foram verificados. O que não se confere olhando são
  estas duas, porque as duas falham produzindo um documento que **parece**
  certo: uma ordem plausível, e um sumário a que falta a última linha.
*/

const insignia = (code: string, conquistadaEm?: string): InsigniaConquistada => ({
  id: code, code, name: code, description: `Descrição de ${code}`,
  icon: 'star', tier: 'amigo', conquistadaEm, contexto: {},
});

describe('a ordem das conquistas no relatório', () => {
  /*
    Da mais antiga para a mais nova. `useBadges` traz por `awarded_at`
    descendente, que é o certo na estante — lá a pergunta é "o que eu ganhei
    agora?". No documento entregue ao clube a pergunta é "por onde esta pessoa
    passou?", e percurso se lê do começo.
  */
  it('vai da mais antiga para a mais nova', () => {
    const fora = [
      insignia('maio', '2026-05-02T23:30:00Z'),
      insignia('janeiro', '2026-01-11T14:00:00Z'),
      insignia('marco', '2026-03-20T09:00:00Z'),
    ];
    expect(emOrdemDeConquista(fora).map(i => i.code)).toEqual(['janeiro', 'marco', 'maio']);
  });

  /*
    Quem não tem data vai para o fim.

    `awarded_at` é NOT NULL, então isto não deveria acontecer — mas se um dump
    antigo ou uma linha remendada trouxer uma sem data, pôr essa insígnia no
    começo afirmaria que ela foi a primeira, que é exatamente o que não se
    sabe. É a assimetria do `umDe`: o lado que reivindica menos.
  */
  it('põe no fim a que não tem data, em vez de dizer que foi a primeira', () => {
    const lista = [insignia('sem'), insignia('com', '2026-01-11T14:00:00Z')];
    expect(emOrdemDeConquista(lista).map(i => i.code)).toEqual(['com', 'sem']);
  });

  it('trata data ilegível como data ausente', () => {
    const lista = [insignia('quebrada', 'ontem à tarde'), insignia('boa', '2026-01-11T14:00:00Z')];
    expect(emOrdemDeConquista(lista).map(i => i.code)).toEqual(['boa', 'quebrada']);
  });

  /* Não mexe na lista de quem chamou: a tela desenha a mesma lista, e ordenar
     no lugar mudaria o que ela mostra por efeito colateral. */
  it('devolve uma lista nova', () => {
    const original = [insignia('b', '2026-05-02T00:00:00Z'), insignia('a', '2026-01-01T00:00:00Z')];
    const ordenada = emOrdemDeConquista(original);
    expect(original.map(i => i.code)).toEqual(['b', 'a']);
    expect(ordenada).not.toBe(original);
  });
});

describe('as folhas reservadas para o sumário', () => {
  /*
    O sumário é escrito em folhas reservadas **antes** do corpo, porque só se
    sabe em que página uma seção caiu depois de compor — e inserir folhas
    depois empurraria as páginas, deixando todo número apontando para a
    anterior à certa.

    Reservar de menos não estoura: a entrada que sobra é desenhada numa folha
    que não existe, ou por cima do rodapé. Sumário sem a última linha é
    indistinguível de sumário completo para quem não conhece o documento.
  */
  it('cresce de folha em folha, e nunca reserva zero', () => {
    const porPagina = GEOMETRIA_DO_SUMARIO.entradasPorPagina;
    expect(paginasDoSumario(0)).toBe(1);
    expect(paginasDoSumario(1)).toBe(1);
    expect(paginasDoSumario(porPagina)).toBe(1);
    expect(paginasDoSumario(porPagina + 1)).toBe(2);
    expect(paginasDoSumario(porPagina * 2)).toBe(2);
    expect(paginasDoSumario(porPagina * 2 + 1)).toBe(3);
  });

  /*
    E a conta tem de caber na folha de verdade.

    `paginasDoSumario` conta entradas; o papel tem altura. Se alguém mexer nas
    margens, na altura da linha ou no número por página sem refazer esta conta,
    as últimas entradas da folha saem por baixo do rodapé — e de novo sem erro
    nenhum.
  */
  it('cabe na altura útil da folha, com o cabeçalho do sumário', () => {
    const { entradasPorPagina, alturaDaEntrada, alturaDoCabecalho, alturaUtil } = GEOMETRIA_DO_SUMARIO;
    const ocupado = alturaDoCabecalho + entradasPorPagina * alturaDaEntrada;
    expect(ocupado, `${entradasPorPagina} entradas ocupam ${ocupado}mm e a folha tem ${alturaUtil}mm`)
      .toBeLessThanOrEqual(alturaUtil);
  });
});
