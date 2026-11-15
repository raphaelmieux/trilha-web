import { describe, it, expect } from 'vitest';
import { getAllSpecialties } from './index';
import { VEREDAS } from './veredas';
import {
  LABORATORIOS_PREVISTOS, laboratoriosDaTrilha, laboratoriosDaVereda, tiposDeLaboratorioDaTrilha,
} from './laboratoriosPrevistos';

/*
  O número de laboratórios de cada percurso anunciado é compromisso: a Faixa
  reserva o lugar dos satélites antes de a lição existir.

  Duas formas de errar, as duas caladas. A anunciada sem número fica sem
  satélite nenhum reservado, e a Faixa parece completa com um buraco que não
  se vê. E a que abre com outro número desloca o anel inteiro dela, sem nada
  reprovar — a Faixa de quem já a via muda de desenho.
*/
const TRILHAS = getAllSpecialties();
const CODIGOS = [...TRILHAS.map(t => t.code), ...VEREDAS.map(v => v.code)];

describe('laboratórios previstos', () => {
  it('toda trilha e vereda anunciada tem o seu número', () => {
    const anunciadas = [...TRILHAS.filter(t => t.emConstrucao), ...VEREDAS.filter(v => v.emConstrucao)];
    expect(anunciadas.length, 'nenhuma anunciada: a trava não conferiria nada').toBeGreaterThan(0);
    for (const p of anunciadas) {
      expect(LABORATORIOS_PREVISTOS[p.code], `${p.code} anunciada sem laboratórios previstos`).toBeGreaterThan(0);
    }
  });

  it('nenhum número sobra para um percurso que não existe', () => {
    for (const codigo of Object.keys(LABORATORIOS_PREVISTOS)) {
      expect(CODIGOS, `${codigo} tem previsão e não está no registro`).toContain(codigo);
    }
  });

  /* Abrir com outro número é permitido, mas não calado: muda-se a tabela junto. */
  it('o percurso que abriu tem exatamente os laboratórios que previu', () => {
    for (const t of TRILHAS.filter(t => !t.emConstrucao && t.code in LABORATORIOS_PREVISTOS)) {
      expect(laboratoriosDaTrilha(t), `${t.code} abriu com outro número de laboratórios`).toBe(LABORATORIOS_PREVISTOS[t.code]);
    }
    for (const v of VEREDAS.filter(v => !v.emConstrucao && v.code in LABORATORIOS_PREVISTOS)) {
      expect(laboratoriosDaVereda(v), `${v.code} abriu com outro número de laboratórios`).toBe(LABORATORIOS_PREVISTOS[v.code]);
    }
  });
});

/*
  Cada tipo de laboratório pertence a uma trilha só.

  A insígnia do laboratório de trilha é `lab_<tipo>`, do tipo e não da lição.
  Um tipo em duas trilhas rende uma insígnia só para as duas, e o pin dela não
  tem como orbitar dois patches na Faixa: uma das trilhas fica com um satélite
  a menos, e quem venceu o laboratório nela não vê nada acender. O motor pode
  ser o mesmo — a redação guiada serve a três trilhas —; o tipo, não.
*/
describe('tipo de laboratório exclusivo por trilha', () => {
  it('nenhum tipo aparece em duas trilhas', () => {
    const dono = new Map<string, string>();
    const repetidos: string[] = [];
    for (const t of TRILHAS) {
      for (const tipo of tiposDeLaboratorioDaTrilha(t)) {
        const outra = dono.get(tipo);
        if (outra) repetidos.push(`${tipo} em ${outra} e ${t.code}`);
        else dono.set(tipo, t.code);
      }
    }
    expect(dono.size, 'nenhum laboratório lido: a trava não conferiria nada').toBeGreaterThan(20);
    expect(repetidos).toEqual([]);
  });
});
