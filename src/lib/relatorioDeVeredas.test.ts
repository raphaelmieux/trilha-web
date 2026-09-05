import { describe, it, expect } from 'vitest';
import { montarRelatorioDeVeredas, type AndamentoDaVereda } from './relatorioDeVeredas';
import { VEREDAS, veredasAbertas, licoesDaVereda } from '../curriculum/veredas';
import type { Certification } from '../types';

/*
  O relatório é o documento entregue ao clube, e o que ele omite não existe.

  Ele só citava vereda concluída. Quem estava no meio de uma — que é onde quase
  todo mundo está — não aparecia de jeito nenhum: a seção inteira sumia, e o
  documento dizia, por omissão, que a pessoa não tinha feito nada além das
  trilhas. Omissão num relatório de aprendizagem não é neutra.
*/

const cc001 = VEREDAS.find(v => v.code === 'CC001')!;
const cc002 = VEREDAS.find(v => v.code === 'CC002')!;

const idsDe = (code: string, quantas: number) => {
  const v = VEREDAS.find(x => x.code === code)!;
  return new Set(licoesDaVereda(v).slice(0, quantas).map(l => l.id));
};

const andamentoDe = (code: string, vencidas: number): AndamentoDaVereda => {
  const v = VEREDAS.find(x => x.code === code)!;
  const total = licoesDaVereda(v).length;
  return { id: v.id, vencidas, total, concluida: total > 0 && vencidas === total };
};

const certificado = (code: string): Certification => ({
  id: 'c1', code: 'TW-1', hash: 'h', level: 'basico',
  curriculum_code: code, curriculum_version: '1.0',
  status: 'active', issued_at: '2026-01-01T00:00:00Z', user_id: 'u1',
} as unknown as Certification);

describe('quem não tocou em vereda nenhuma', () => {
  it('não ganha seção, e o relatório não inventa uma linha de zeros', () => {
    const r = montarRelatorioDeVeredas(veredasAbertas(), [], {}, [], 'Ana');
    expect(r.percursos).toEqual([]);
    expect(r.introducao).toBe('');
    expect(r.conquistas).toBe('');
  });

  /* Vereda aberta e nunca tocada não vira linha: listar as trinta e duas com
     zero encheria o documento de linhas iguais que não dizem nada. */
  it('vereda com zero lições vencidas fica de fora', () => {
    const r = montarRelatorioDeVeredas(
      veredasAbertas(), [andamentoDe('CC001', 0)], {}, [], 'Ana');
    expect(r.percursos).toEqual([]);
  });
});

describe('quem está no meio de uma vereda', () => {
  const meio = () => montarRelatorioDeVeredas(
    [cc001], [andamentoDe('CC001', 3)], { [cc001.id]: idsDe('CC001', 3) }, [], 'Ana');

  /* Era exatamente este caso que sumia do documento. */
  it('aparece no relatório', () => {
    expect(meio().percursos.map(p => p.code)).toEqual(['CC001']);
  });

  it('a frase diz onde ela está, e não que concluiu', () => {
    const [p] = meio().percursos;
    expect(p.concluida).toBe(false);
    expect(p.frase).toContain('Está em percurso');
    expect(p.frase).not.toContain('inteira');
  });

  /* "Cinco de catorze" é um número; separar teoria de prática diz o que a
     pessoa sabe e o que ela ainda não pôs em prática. */
  it('separa o que é teoria do que é prática', () => {
    const [p] = meio().percursos;
    expect(p.frase).toMatch(/teoria/);
  });

  it('o fechamento diz que ela está em percurso', () => {
    expect(meio().conquistas).toContain('em percurso');
    expect(meio().conquistas).toContain('CC001');
  });
});

describe('quem concluiu', () => {
  const feita = (certificados: Certification[] = []) => montarRelatorioDeVeredas(
    [cc001],
    [andamentoDe('CC001', licoesDaVereda(cc001).length)],
    { [cc001.id]: new Set(licoesDaVereda(cc001).map(l => l.id)) },
    certificados,
    'Ana');

  it('a frase diz que percorreu a vereda inteira', () => {
    const [p] = feita().percursos;
    expect(p.concluida).toBe(true);
    expect(p.percent).toBe(100);
    expect(p.frase).toContain('inteira');
  });

  /* Sem certificado emitido, o relatório diz que ele existe a pedido — e não
     que foi emitido. Afirmar um documento que ninguém tirou é o erro que a
     verificação pública desmentiria na hora. */
  it('sem Token.Web() emitido, diz que ele sai a pedido', () => {
    expect(feita().conquistas).toContain('a pedido');
    expect(feita().conquistas).not.toContain('rendeu Token.Web()');
  });

  it('com Token.Web() emitido, nomeia a vereda que o rendeu', () => {
    const r = feita([certificado('CC001')]);
    expect(r.conquistas).toContain('rendeu Token.Web()');
    expect(r.conquistas).toContain('CC001');
  });

  /* Certificado revogado não conta: exibir como emitido um documento que foi
     revogado é afirmar o que a verificação pública nega. */
  it('certificado revogado não conta como emitido', () => {
    const revogado = { ...certificado('CC001'), status: 'revoked' } as Certification;
    expect(feita([revogado]).conquistas).toContain('a pedido');
  });
});

describe('a explicação do que é uma vereda', () => {
  const r = () => montarRelatorioDeVeredas(
    [cc001, cc002],
    [andamentoDe('CC001', licoesDaVereda(cc001).length), andamentoDe('CC002', 2)],
    {
      [cc001.id]: new Set(licoesDaVereda(cc001).map(l => l.id)),
      [cc002.id]: idsDe('CC002', 2),
    },
    [], 'Ana');

  /*
    Quem lê o relatório conhece a ficha das especialidades e nunca ouviu falar
    de vereda. Sem a abertura, os parágrafos seguintes parecem falar de
    especialidades que a liderança não encontra em documento nenhum.
  */
  it('abre dizendo o que é, antes de listar qualquer coisa', () => {
    expect(r().introducao).toContain('caminho estreito');
    expect(r().introducao).toContain('não entra no percentual');
    expect(r().introducao).toContain('Ana');
  });

  it('conta as concluídas e as em curso, separadas', () => {
    expect(r().conquistas).toContain('concluiu 1 vereda');
    expect(r().conquistas).toContain('está em percurso em 1 outra');
  });

  it('lista as duas, na ordem em que vieram', () => {
    expect(r().percursos.map(p => p.code)).toEqual(['CC001', 'CC002']);
  });
});
