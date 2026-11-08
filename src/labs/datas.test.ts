import { describe, it, expect, afterEach, vi } from 'vitest';
import { serieDe, serieDoTexto, textoDaData, dataCompleta, diaDaSerie, serieDeHoje } from './datas';
import { type Bruto, valorDaFormula, valorDoBruto, mostrar } from './formulas';

/*
  As datas da planilha.

  Por dentro, data é número de série — dias desde 30/12/1899 —, e é isso que o
  Excel faz; por fora, é dd/mm/aaaa. As travas aqui conferem o que erra calado:
  o número que o Excel daria, o dia que não existe virando texto, as duas
  funções com a ordem dos argumentos trocada, e a idade que não pode contar o
  aniversário antes de ele chegar.
*/

const grade = (linhas: string[][]): Bruto => (l, c) => linhas[l]?.[c] ?? '';
const ver = (linhas: string[][], formula: string, formato?: Parameters<typeof mostrar>[1]) =>
  mostrar(valorDaFormula(grade(linhas), formula), formato);

afterEach(() => { vi.useRealTimers(); });

describe('o número que a data é', () => {
  it('são os números do Excel', () => {
    expect(serieDe(2026, 11, 8)).toBe(46334);
    expect(serieDe(1900, 3, 1)).toBe(61);
    expect(serieDe(2000, 1, 1)).toBe(36526);
    expect(textoDaData(46334)).toBe('08/11/2026');
  });

  it('o que se digita como data vira número, e o dia que não existe continua texto', () => {
    expect(valorDoBruto('08/11/2026')).toEqual({ tipo: 'numero', n: 46334 });
    expect(valorDoBruto('8/11/26')).toEqual({ tipo: 'numero', n: 46334 });
    expect(valorDoBruto('2026-11-08')).toEqual({ tipo: 'numero', n: 46334 });
    expect(valorDoBruto('31/02/2026').tipo, '31 de fevereiro virou 3 de março calado').toBe('texto');
    expect(valorDoBruto("'08/11/2026").tipo, 'o apóstrofo continua dizendo "isto é texto"').toBe('texto');
  });

  it('ano de dois dígitos segue a regra do Excel, e sem ano vale o de hoje', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-08T15:00:00Z'));
    expect(dataCompleta('1/3/29')).toBe('01/03/2029');
    expect(dataCompleta('1/3/30')).toBe('01/03/1930');
    expect(dataCompleta('15/7')).toBe('15/07/2026');
    expect(serieDoTexto('texto')).toBeNull();
  });

  it('hoje é o dia de Brasília, e não o de Greenwich', () => {
    vi.useFakeTimers();
    /* 22h em Brasília já é dia seguinte em UTC. */
    vi.setSystemTime(new Date('2026-11-09T01:00:00Z'));
    expect(textoDaData(serieDeHoje())).toBe('08/11/2026');
  });

  it('o formato muda o que se vê, e não o número', () => {
    const v = valorDoBruto('08/11/2026');
    expect(mostrar(v, 'data')).toBe('08/11/2026');
    expect(mostrar(v, 'geral')).toBe('46334');
    expect(mostrar({ tipo: 'numero', n: -1 }, 'data')).toMatch(/^#+$/);
  });

  it('data entre aspas também faz conta, e data entra em critério', () => {
    expect(ver([], '="08/11/2026"+1', 'data')).toBe('09/11/2026');
    const datas = [['01/07/2026'], ['15/07/2026'], ['02/08/2026']];
    expect(ver(datas, '=CONT.SE(A1:A3;">10/07/2026")')).toBe('2');
  });
});

describe('as funções de data', () => {
  const NASC = [['14/11/2014', '08/11/2026']];

  it('HOJE é a data de hoje, e não aceita argumento', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-08T15:00:00Z'));
    expect(ver([], '=HOJE()', 'data')).toBe('08/11/2026');
    expect(ver([], '=HOJE(1)')).toBe('#VALOR!');
  });

  it('DATA monta a data, e mês e dia transbordam como no Excel', () => {
    expect(ver([], '=DATA(2026;11;8)', 'data')).toBe('08/11/2026');
    expect(ver([], '=DATA(2026;13;1)', 'data')).toBe('01/01/2027');
    expect(ver([], '=DATA(2026;3;0)', 'data'), 'dia 0 é o último do mês anterior').toBe('28/02/2026');
    expect(ver([], '=DATA(26;1;1)', 'data'), 'ano curto soma 1900').toBe('01/01/1926');
  });

  it('DIA, MÊS e ANO leem a data, com acento ou sem', () => {
    expect(ver(NASC, '=DIA(A1)')).toBe('14');
    expect(ver(NASC, '=MÊS(A1)')).toBe('11');
    expect(ver(NASC, '=MES(A1)')).toBe('11');
    expect(ver(NASC, '=ANO(A1)')).toBe('2014');
  });

  it('DIAS recebe o fim primeiro, e trocar dá negativo', () => {
    const viagem = [['10/07/2026', '13/07/2026']];
    expect(ver(viagem, '=DIAS(B1;A1)')).toBe('3');
    expect(ver(viagem, '=DIAS(A1;B1)')).toBe('-3');
  });

  /*
    A idade é o uso que todo clube faz. Quem nasceu em 14/11/2014 tem 11 anos
    em 08/11/2026 — faz 12 daqui a seis dias. Subtrair os anos daria 12, e é
    esse o número plausível e errado que DATADIF existe para não dar.
  */
  it('DATADIF conta anos completos: o aniversário que ainda não chegou não conta', () => {
    expect(ver(NASC, '=DATADIF(A1;B1;"Y")')).toBe('11');
    expect(ver(NASC, '=ANO(B1)-ANO(A1)')).toBe('12');
    expect(ver(NASC, '=DATADIF(A1;B1;"M")')).toBe('143');
    expect(ver(NASC, '=DATADIF(A1;B1;"YM")')).toBe('11');
    expect(ver(NASC, '=DATADIF(A1;B1;"D")')).toBe(String(46334 - serieDe(2014, 11, 14)));
  });

  it('DATADIF com o começo depois do fim, ou com unidade em português, é #NÚM!', () => {
    expect(ver(NASC, '=DATADIF(B1;A1;"Y")')).toBe('#NÚM!');
    expect(ver(NASC, '=DATADIF(A1;B1;"A")')).toBe('#NÚM!');
  });

  it('DATADIF "MD" e "YD" contam o que sobra', () => {
    const d = [['31/01/2026', '01/03/2026', '15/03/2025', '10/03/2026']];
    expect(ver(d, '=DATADIF(A1;B1;"M")')).toBe('1');
    expect(ver(d, '=DATADIF(C1;D1;"YD")')).toBe('360');
    expect(ver([['10/01/2026', '05/03/2026']], '=DATADIF(A1;B1;"MD")')).toBe('23');
  });

  it('DIA.DA.SEMANA começa no domingo, e o tipo 2 começa na segunda', () => {
    /* 08/11/2026 é um domingo. */
    expect(diaDaSerie(46334).semana).toBe(0);
    expect(ver(NASC, '=DIA.DA.SEMANA(B1)')).toBe('1');
    expect(ver(NASC, '=DIA.DA.SEMANA(B1;2)')).toBe('7');
    expect(ver(NASC, '=DIA.DA.SEMANA(B1;3)')).toBe('6');
    expect(ver(NASC, '=DIA.DA.SEMANA(B1;9)')).toBe('#NÚM!');
  });

  it('data mais um é o dia seguinte, e ordena como número', () => {
    expect(ver(NASC, '=B1+30', 'data')).toBe('08/12/2026');
    expect(ver(NASC, '=B1>A1')).toBe('VERDADEIRO');
    expect(ver(NASC, '=MÁXIMO(A1:B1)', 'data')).toBe('08/11/2026');
  });
});
